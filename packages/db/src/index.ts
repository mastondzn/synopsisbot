import { drizzle } from 'drizzle-orm/postgres-js';
import postgres, { type Sql } from 'postgres';

import { EditHelpers } from './helpers/edit';
import { FindHelpers } from './helpers/find';
import { schema } from './schema';
import type { Database, DatabaseOptions } from './types';

export function createDatabase(options: DatabaseOptions): { db: Database, sql: Sql } {
    const sql = postgres(options);
    const db = drizzle(sql, { ...options, schema });

    const find = new FindHelpers(db);
    const edit = new EditHelpers(db);

    return { db: Object.assign(db, { find, edit }), sql };
}

export * from './types';
export * from './schema';
export * from 'drizzle-orm/postgres-js';
export * from 'drizzle-orm';
