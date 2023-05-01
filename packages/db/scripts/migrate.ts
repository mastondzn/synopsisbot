import { resolve } from 'node:path';

import { config } from 'dotenv';
import { migrate } from 'drizzle-orm/node-postgres/migrator';

import { envSchema } from '@synopsis/env';

import { makeDatabase } from '~/index';

config({ path: resolve(process.cwd(), '../../.env') });

void (async () => {
    const env = envSchema.parse(process.env);

    const { db, pool } = makeDatabase({
        host: env.DB_HOST,
        user: env.DB_USERNAME,
        password: env.DB_PASSWORD,
        database: env.DB_NAME,
        logger: true,
    });

    console.log('Migrating...');
    await migrate(db, {
        migrationsFolder: './migrations',
    });
    console.log('Migrations complete!');
    await pool.end();
    console.log('Client connection ended!');
})();
