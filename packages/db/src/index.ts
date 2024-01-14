import { drizzle } from 'drizzle-orm/postgres-js';
import { Kysely } from 'kysely';
import { PostgresJSDialect } from 'kysely-postgres-js';
import postgres from 'postgres';

import { EditHelpers } from './helpers/edit';
import { FindHelpers } from './helpers/find';
import { schema } from './schema';
import type { Database, DatabaseOptions, KyselyDatabase } from './types';

export function createDatabase(options: DatabaseOptions): Database {
    const sql = postgres(options);
    const db = drizzle(sql, { ...options, schema });
    const dialect = new PostgresJSDialect({
        postgres: sql,
    });

    const find = new FindHelpers(db);
    const edit = new EditHelpers(db);
    const ky = new Kysely<KyselyDatabase>({ dialect });

    return Object.assign(db, { find, edit, ky, raw: sql });
}

export * from './types';
export * from './schema';
export * from 'drizzle-orm/postgres-js';
export * from 'drizzle-orm';
