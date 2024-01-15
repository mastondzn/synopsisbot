import type { AnyTable, DrizzleConfig } from 'drizzle-orm';
import type { Kyselify } from 'drizzle-orm/kysely';
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import type { Kysely } from 'kysely';
import type { Options, Sql } from 'postgres';

import type { EditHelpers } from './helpers/edit';
import type { FindHelpers } from './helpers/find';
import type { DatabaseSchema } from './schema';

export type DrizzleDatabase = PostgresJsDatabase<DatabaseSchema>;
export type KyselyDatabase = {
    [T in keyof DatabaseSchema]: DatabaseSchema[T] extends AnyTable ? Kyselify<DatabaseSchema[T]> : never;
};

export type Database = DrizzleDatabase & {
    find: FindHelpers;
    edit: EditHelpers;
    ky: Kysely<KyselyDatabase>;
    raw: Sql;
};

export type DatabaseOptions = Omit<DrizzleConfig, 'schema'> & Options<NonNullable<unknown>>;
export type DatabaseClient = Sql;
