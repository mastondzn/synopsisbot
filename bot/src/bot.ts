import { type Collection } from '@discordjs/collection';
import { ApiClient } from '@twurple/api';
import { type Redis } from 'ioredis';

import { makeDatabase, type NodePgDatabase, type Pool } from '@synopsis/db';

import { env } from '~/utils/env';

import { type BotAuthProvider, makeBotAuthProvider } from './auth-provider';
import { makeCache } from './cache';
import { ShardedChatClient } from './client';
import { type BotCommand, type BotEventHandler } from './types/client';

export interface BotOptions {
    events: Collection<string, BotEventHandler>;
    commands: Collection<string, BotCommand>;
}

export class Bot {
    chat!: ShardedChatClient;
    api!: ApiClient;
    authProvider!: BotAuthProvider;

    db: NodePgDatabase;
    pool: Pool;
    cache: Redis;

    events: Collection<string, BotEventHandler>;
    commands: Collection<string, BotCommand>;

    constructor({ events, commands }: BotOptions) {
        const { db, pool } = makeDatabase({
            host: env.DB_HOST,
            user: env.DB_USERNAME,
            password: env.DB_PASSWORD,
            database: env.DB_NAME,
        });

        const cache = makeCache({
            host: env.REDIS_HOST,
            password: env.REDIS_PASSWORD,
        });

        this.events = events;
        this.commands = commands;

        this.db = db;
        this.pool = pool;
        this.cache = cache;
    }

    async initialize() {
        this.authProvider = await makeBotAuthProvider({
            db: this.db,
            botId: env.TWITCH_BOT_ID,
            clientId: env.TWITCH_CLIENT_ID,
            clientSecret: env.TWITCH_CLIENT_SECRET,
        });

        this.api = new ApiClient({ authProvider: this.authProvider });

        this.chat = new ShardedChatClient({
            authProvider: this.authProvider,
            channels: [env.TWITCH_BOT_USERNAME],
            isDev: env.NODE_ENV === 'development',
        });

        for (const [, { event, handler }] of this.events) {
            this.chat.registerEvent({
                event,
                handler: (...args: unknown[]) => {
                    return void handler({
                        api: this.api,
                        cache: this.cache,
                        commands: this.commands,
                        db: this.db,
                        client: this.chat,
                        params: args as never,
                    });
                },
            } as never);
        }
    }

    async stop(): Promise<void> {
        await Promise.all([this.cache.quit(), this.pool.end(), this.chat.destroy()]);
    }
}
