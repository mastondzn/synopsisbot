import { ApiClient } from '@twurple/api';
import { type RefreshingAuthProvider } from '@twurple/auth';
import { type Redis } from 'ioredis';

import { makeDatabase, type NodePgDatabase, type Pool } from '@synopsis/db';
import { parseEnv } from '@synopsis/env';

import { makeRefreshingAuthProvider } from './auth-provider';
import { makeCache } from './cache';
import { ShardedChatClient } from './client';

export class Bot {
    private readonly env = parseEnv(process.env);

    public chat!: ShardedChatClient;
    public api!: ApiClient;
    public authProvider!: RefreshingAuthProvider;

    public db: NodePgDatabase;
    public pool: Pool;
    public cache: Redis;

    constructor() {
        const { db, pool } = makeDatabase(this.env);
        const cache = makeCache(this.env);

        this.db = db;
        this.pool = pool;
        this.cache = cache;
    }

    async initialize() {
        this.authProvider = await makeRefreshingAuthProvider({
            db: this.db,
            env: this.env,
        });
        console.log('AuthProvider initialized!');

        this.api = new ApiClient({ authProvider: this.authProvider });
        this.chat = new ShardedChatClient({
            authProvider: this.authProvider,
            channels: [this.env.TWITCH_BOT_USERNAME],
            isDev: this.env.NODE_ENV === 'development',
        });
        console.log('Chat client initialized!');
    }

    async stop(): Promise<void> {
        await Promise.all([this.cache.quit(), this.pool.end(), this.chat.destroy()]);
    }
}
