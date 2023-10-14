import type { Config } from 'drizzle-kit';

import { env } from '@synopsis/env/node';

export default {
    schema: './src/schema/index.ts',
    out: './migrations',
    driver: 'pg',
    dbCredentials: {
        host: env.DB_HOST,
        user: env.DB_USERNAME,
        password: env.DB_PASSWORD,
        database: env.DB_NAME,
    },
} satisfies Config;
