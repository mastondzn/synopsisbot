import { drizzle, type DrizzleConfig } from 'drizzle-orm/node-postgres';
import { Pool, type PoolConfig } from 'pg';

export type MakeDatabaseOptions = DrizzleConfig & PoolConfig;

export const makeDatabase = (options: MakeDatabaseOptions) => {
    const pool = new Pool(options);
    return { db: drizzle(pool, options), pool };
};

export * from './schema';
export * from 'drizzle-orm/node-postgres';
export * from 'drizzle-orm';

export { type Pool } from 'pg';
