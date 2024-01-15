import { createDatabase } from '@synopsis/db';
import { env } from '@synopsis/env/next';

export const db = createDatabase({
    host: env.DB_HOST,
    user: env.DB_USERNAME,
    password: env.DB_PASSWORD,
    database: env.DB_NAME,
});
