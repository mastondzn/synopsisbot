import { resolve } from 'node:path';

import { config } from 'dotenv';
import { migrate } from 'drizzle-orm/postgres-js/migrator';

import { envSchema } from '@synopsis/env';

import { createDatabase } from '~/index';

config({ path: resolve(process.cwd(), '../../.env') });

async function main() {
    const env = envSchema.parse(process.env);

    const { db } = createDatabase({
        host: env.DB_HOST,
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
}

void main();
