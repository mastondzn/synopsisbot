import { environmentSchema } from '@synopsis/env';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import { parseEnv } from 'znv';

import { createDatabase } from '~/index';

// eslint-disable-next-line unicorn/prevent-abbreviations
const env = parseEnv(process.env, environmentSchema.shape);

async function main() {
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
