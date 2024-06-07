import type { DrizzleConfig, Table } from 'drizzle-orm';
import type { Kyselify } from 'drizzle-orm/kysely';
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import type { Kysely } from 'kysely';
import type { Options, Sql } from 'postgres';

import type { DatabaseSchema } from './schema';

export type DrizzleDatabase = PostgresJsDatabase<DatabaseSchema>;
export type KyselyDatabase = {
    [T in keyof DatabaseSchema]: DatabaseSchema[T] extends Table
        ? Kyselify<DatabaseSchema[T]>
        : never;
};

export type Database = DrizzleDatabase & {
    ky: Kysely<KyselyDatabase>;
    raw: Sql;
};

export type DatabaseOptions = Omit<DrizzleConfig, 'schema'> & Options<NonNullable<unknown>>;
export type DatabaseClient = Sql;
