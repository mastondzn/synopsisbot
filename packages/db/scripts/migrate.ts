import { env } from '@synopsis/env/node';
import { migrate } from 'drizzle-orm/postgres-js/migrator';

import { createDatabase } from '~/index';

async function main() {
    const db = createDatabase({
        host: 'localhost',
        user: env.DB_USERNAME,
        password: env.DB_PASSWORD,
        database: env.DB_NAME,
        logger: true,
        max: 1,
    });

    console.log('Migrating...');
    await migrate(db, {
        migrationsFolder: './migrations',
    });
    console.log('Migrations complete!');

    await db.raw.end();
}

void main();
