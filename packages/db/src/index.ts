import { drizzle } from 'drizzle-orm/postgres-js';
import postgres, { type Sql } from 'postgres';

import { schema } from './schema';
import { type Database, type DatabaseOptions } from './types';

export const createDatabase = (options: DatabaseOptions): { db: Database; client: Sql } => {
    const client = postgres(options);
    const db = drizzle(client, { ...options, schema });

    return { db, client };
};

export * from './types';
export * from './schema';
export * from './helpers';
export * from 'drizzle-orm/postgres-js';
export * from 'drizzle-orm';
