import { drizzle } from 'drizzle-orm/postgres-js';
import { Kysely } from 'kysely';
import { PostgresJSDialect } from 'kysely-postgres-js';
import postgres from 'postgres';

import { schema } from './schema';
import type { Database, DatabaseOptions, KyselyDatabase } from './types';

export function createDatabase(options: DatabaseOptions): Database {
    const raw = postgres(options);
    const db = drizzle(raw, { ...options, schema });

    const ky = new Kysely<KyselyDatabase>({
        dialect: new PostgresJSDialect({ postgres: raw }),
    });

    return Object.assign(db, { ky, raw });
}

export { migrate } from './migrate';
export { seed } from './seed';
export type * from './types';
export * from './schema';
export * from 'drizzle-orm/postgres-js';
export * from 'drizzle-orm';
