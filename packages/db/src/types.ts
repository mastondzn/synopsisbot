import { type NodePgDatabase } from 'drizzle-orm/node-postgres';

import { type DatabaseSchema } from './schema';

export type Database = NodePgDatabase<DatabaseSchema>;
