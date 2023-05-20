import { type DrizzleConfig } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Client, type ClientConfig, Pool, type PoolConfig } from 'pg';

import { schema } from './schema';
import { type Database } from './types';

export const makeDatabase = (
    options: Omit<DrizzleConfig, 'schema'> & PoolConfig
): { db: Database; pool: Pool } => {
    const pool = new Pool(options);
    const db = drizzle(pool, { ...options, schema });

    return { db, pool };
};

export const makeDatabaseClient = (
    options: Omit<DrizzleConfig, 'schema'> & ClientConfig //
): { db: Database; client: Client } => {
    const client = new Client(options);
    const db = drizzle(client, { ...options, schema });

    return { db, client };
};

export * from './types';
export * from './schema';
export * from './helpers';
export * from 'drizzle-orm/node-postgres';
export * from 'drizzle-orm';
export { type Pool } from 'pg';
