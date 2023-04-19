import { resolve } from 'node:path';

import { config } from 'dotenv';
import { migrate } from 'drizzle-orm/node-postgres/migrator';

import { parseEnv } from '@synopsis/env';

import { makeDatabaseClient } from '~/index';

config({ path: resolve(process.cwd(), '../../.env') });

void (async () => {
    const env = parseEnv(process.env);
    const { db, client } = makeDatabaseClient({
        host: env.DB_HOST,
        user: env.DB_USERNAME,
        password: env.DB_PASSWORD,
        database: env.DB_NAME,
    });

    console.log('Migrating...');
    await migrate(db, {
        migrationsFolder: './migrations',
    });
    console.log('Migrations complete!');
    await client.end();
    console.log('Client connection ended!');
})();
