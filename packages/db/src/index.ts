import { drizzle } from 'drizzle-orm/postgres-js';
import postgres, { type Sql } from 'postgres';

import { schema } from './schema';
import { type Database, type DatabaseOptions } from './types';

export const createDatabase = (options: DatabaseOptions): { db: Database; sql: Sql } => {
    const sql = postgres(options);
    const db = drizzle(sql, { ...options, schema });

    return { db, sql };
};

export * from './types';
export * from './schema';
export * from './helpers';
export * from 'drizzle-orm/postgres-js';
export * from 'drizzle-orm';
