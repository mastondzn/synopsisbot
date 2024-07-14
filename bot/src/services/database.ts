import { createDatabase } from '@synopsis/db';
import { env } from '@synopsis/env/node';
import isDocker from 'is-docker';

export const db = createDatabase({
    host: isDocker() ? 'db' : 'localhost',
    user: env.DB_USERNAME,
    password: env.DB_PASSWORD,
    database: env.DB_NAME,
    // disables some logs (during migrations for example)
    // eslint-disable-next-line ts/no-empty-function
    onnotice: () => {},
});
