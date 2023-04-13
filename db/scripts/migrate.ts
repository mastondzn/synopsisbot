import { resolve } from 'node:path';

import { config } from 'dotenv';
import { migrate } from 'drizzle-orm/node-postgres/migrator';

import { parseEnv } from '@synopsis/env';

import { makeDatabase } from '~/index';

config({ path: resolve(process.cwd(), '../.env') });

void (async () => {
    const env = parseEnv(process.env);
    const { db, pool } = makeDatabase(env, { logger: true });
    await migrate(db, {
        migrationsFolder: './migrations',
    });
    await pool.end();
})();
