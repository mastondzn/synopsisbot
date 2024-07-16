import { env } from '@synopsis/env/node';
import isDocker from 'is-docker';

import { createDatabase } from '../src';
import { seed } from '../src/seed';

const db = createDatabase({
    host: isDocker() ? 'db' : 'localhost',
    user: env.DB_USERNAME,
    password: env.DB_PASSWORD,
    database: env.DB_NAME,
    logger: true,
    max: 1,
});

await seed(db, env);
await db.raw.end();
