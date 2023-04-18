import { type Collection } from '@discordjs/collection';
import { ApiClient } from '@twurple/api';
import { type Redis } from 'ioredis';

import { makeDatabase, type NodePgDatabase, type Pool } from '@synopsis/db';
import { type Env, parseEnv } from '@synopsis/env';

import { BotAuthProvider } from './auth-provider';
import { makeCache } from './cache';
import { ShardedChatClient } from './client';
import { type BotCommand, type BotEventHandler } from './types/client';
import { getAuthedUserById } from './utils/db';

export type BotOptions = {
    events: Collection<string, BotEventHandler>;
    commands: Collection<string, BotCommand>;
    env: unknown;
};

export class Bot {
    readonly env: Env;

    events: Collection<string, BotEventHandler>;
    commands: Collection<string, BotCommand>;

    chat!: ShardedChatClient;
    api!: ApiClient;
    authProvider!: BotAuthProvider;

    db: NodePgDatabase;
    pool: Pool;
    cache: Redis;

    constructor({ events, commands, env }: BotOptions) {
        this.env = parseEnv(env);

        const { db, pool } = makeDatabase(this.env);
        const cache = makeCache(this.env);
        this.db = db;
        this.pool = pool;
        this.cache = cache;

        this.events = events;
        this.commands = commands;
    }

    async initialize() {
        const bot = await getAuthedUserById(this.db, this.env.TWITCH_BOT_ID, {
            throws: true,
        });

        this.authProvider = new BotAuthProvider({
            db: this.db,
            clientId: this.env.TWITCH_CLIENT_ID,
            clientSecret: this.env.TWITCH_CLIENT_SECRET,
            botAccessToken: bot.accessToken,
            botRefreshToken: bot.refreshToken,
            botId: bot.twitchId,
            botScopes: bot.scopes,
            expiresIn: (bot.expiresAt.getTime() - Date.now()) / 1000,
            obtainmentTimestamp: bot.obtainedAt.getTime(),
        });

        this.api = new ApiClient({ authProvider: this.authProvider });

        this.chat = new ShardedChatClient({
            authProvider: this.authProvider,
            channels: [this.env.TWITCH_BOT_USERNAME],
            isDev: this.env.NODE_ENV === 'development',
        });

        for (const [, { event, handler }] of this.events) {
            const registrableEvent = {
                event,
                handler: (...args: unknown[]) =>
                    void handler({
                        api: this.api,
                        cache: this.cache,
                        commands: this.commands,
                        db: this.db,
                        client: this.chat,
                        params: args as never,
                    }),
            };

            this.chat.registerEvent(registrableEvent as never);
        }
    }

    async stop(): Promise<void> {
        await Promise.all([this.cache.quit(), this.pool.end(), this.chat.destroy()]);
    }
}
