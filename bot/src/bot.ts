import { type Collection } from '@discordjs/collection';
import { ApiClient } from '@twurple/api';
import { type RefreshingAuthProvider } from '@twurple/auth';
import { type Redis } from 'ioredis';

import { makeDatabase, type NodePgDatabase, type Pool } from '@synopsis/db';
import { type Env, parseEnv } from '@synopsis/env';

import { makeRefreshingAuthProvider } from './auth-provider';
import { makeCache } from './cache';
import { ShardedChatClient } from './client';
import { type BasicEventHandler, type BotCommand, type BotEventHandler } from './types/client';

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
    authProvider!: RefreshingAuthProvider;

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
        this.authProvider = await makeRefreshingAuthProvider({
            db: this.db,
            env: this.env,
        });
        this.api = new ApiClient({ authProvider: this.authProvider });
        this.chat = new ShardedChatClient({
            authProvider: this.authProvider,
            channels: [this.env.TWITCH_BOT_USERNAME],
            isDev: this.env.NODE_ENV === 'development',
        });

        for (const [, { event, handler }] of this.events) {
            // @ts-expect-error i believe actually trying to type this correctly breaks TS typechecking, this is safe though
            const registrableEvent: BasicEventHandler = {
                event,
                handler: (...args: unknown[]) =>
                    void handler({
                        api: this.api,
                        cache: this.cache,
                        commands: this.commands,
                        db: this.db,
                        client: this.chat,
                        // @ts-expect-error see above
                        params: args,
                    }),
            };

            this.chat.registerEvent(registrableEvent);
        }
    }

    async stop(): Promise<void> {
        await Promise.all([this.cache.quit(), this.pool.end(), this.chat.destroy()]);
    }
}
