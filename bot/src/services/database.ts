import { createDatabase } from '@synopsis/db';
import { env } from '@synopsis/env/node';
import isDocker from 'is-docker';

export const db = createDatabase({
    host: isDocker() ? 'db' : 'localhost',
    user: env.DB_USERNAME,
    password: env.DB_PASSWORD,
    database: env.DB_NAME,
});
