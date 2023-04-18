import { drizzle, type DrizzleConfig } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';

import { type Env } from '@synopsis/env';

export const makeDatabase = (env: Env, config?: DrizzleConfig) => {
    const pool = new Pool({
        host: env.DB_HOST,
        user: env.DB_USERNAME,
        password: env.DB_PASSWORD,
        database: env.DB_NAME,
    });

    return { db: drizzle(pool, config), pool };
};

export * from './schema';
export * from 'drizzle-orm/node-postgres';
export * from 'drizzle-orm';

export { type Pool } from 'pg';
