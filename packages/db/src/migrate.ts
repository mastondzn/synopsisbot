import { migrate as migrator } from 'drizzle-orm/postgres-js/migrator';

import type { Database } from './types';

export async function migrate(db: Database) {
    await migrator(db, {
        migrationsFolder: './migrations',
    });
}
