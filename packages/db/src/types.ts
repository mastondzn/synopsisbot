import { type DrizzleConfig } from 'drizzle-orm';
import { type PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { type Options, type Sql } from 'postgres';

import { type DatabaseSchema } from './schema';

export type Database = PostgresJsDatabase<DatabaseSchema>;
export type DatabaseOptions = Omit<DrizzleConfig, 'schema'> & Options<NonNullable<unknown>>;
export type DatabaseClient = Sql;
