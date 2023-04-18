import { makeDatabase } from '@synopsis/db';

import { env } from '~/env.mjs';

export const { db, pool } = makeDatabase({
    host: env.DB_HOST,
    user: env.DB_USERNAME,
    password: env.DB_PASSWORD,
    database: env.DB_NAME,
    logger: true,
});
