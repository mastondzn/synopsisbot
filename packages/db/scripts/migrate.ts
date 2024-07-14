import { env } from '@synopsis/env/node';

import { createDatabase } from '../src';
import { migrate } from '../src/migrate';

const db = createDatabase({
    host: 'localhost',
    user: env.DB_USERNAME,
    password: env.DB_PASSWORD,
    database: env.DB_NAME,
    logger: true,
    max: 1,
});

await migrate(db);
await db.raw.end();
