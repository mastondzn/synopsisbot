import { ApiClient } from '@twurple/api';
import { type RefreshingAuthProvider } from '@twurple/auth';
import { ChatClient } from '@twurple/chat';
import { type NodePgDatabase } from 'drizzle-orm/node-postgres';
import { type Redis } from 'ioredis';
import { LRUCache } from 'lru-cache';
import { type Pool } from 'pg';

import { makeRefreshingAuthProvider } from './auth-provider';
import { makeCache } from './cache';
import { makeDatabase } from './db';
import { type Env, env } from './env';

export class Bot {
    chat!: ChatClient;
    api!: ApiClient;
    authProvider!: RefreshingAuthProvider;

    db: NodePgDatabase;
    pool: Pool;
    cache: Redis;

    lru: LRUCache<string, string>;
    env: Env;

    constructor() {
        this.env = env;
        this.lru = new LRUCache<string, string>({ max: 1000 });
        const { db, pool } = makeDatabase(this.env);
        this.db = db;
        this.pool = pool;
        this.cache = makeCache(this.env);
    }

    async initialize() {
        this.authProvider = await makeRefreshingAuthProvider({
            db: this.db,
            env: this.env,
        });
        this.api = new ApiClient({ authProvider: this.authProvider });
        this.chat = new ChatClient({
            authProvider: this.authProvider,
            channels: [this.env.TWITCH_BOT_USERNAME],
        });
        await this.chat.connect();
    }

    async stop(): Promise<void> {
        await Promise.all([this.cache.quit(), this.pool.end(), this.chat.quit()]);
    }
}
