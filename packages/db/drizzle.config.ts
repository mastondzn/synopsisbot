import { env } from '@synopsis/env/node';
import type { Config } from 'drizzle-kit';
import isDocker from 'is-docker';

export default {
    schema: './src/schema/index.ts',
    out: './migrations',
    driver: 'pg',
    dbCredentials: {
        host: isDocker() ? 'db' : 'localhost',
        user: env.DB_USERNAME,
        password: env.DB_PASSWORD,
        database: env.DB_NAME,
    },
} satisfies Config;
