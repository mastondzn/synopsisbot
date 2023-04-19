import { drizzle, type DrizzleConfig } from 'drizzle-orm/node-postgres';
import { Client, type ClientConfig, Pool, type PoolConfig } from 'pg';

export const makeDatabase = (options: DrizzleConfig & PoolConfig) => {
    const pool = new Pool(options);
    return { db: drizzle(pool, options), pool };
};

export const makeDatabaseClient = (options: DrizzleConfig & ClientConfig) => {
    const client = new Client(options);
    return { db: drizzle(client, options), client };
};

export * from './schema';
export * from './helpers';
export * from 'drizzle-orm/node-postgres';
export * from 'drizzle-orm';
export { type Pool } from 'pg';
