import { resolve } from 'node:path';

import { config } from 'dotenv';
import type { Config } from 'drizzle-kit';

import { envSchema } from '@synopsis/env';

config({ path: resolve(process.cwd(), '../../.env') });

const env = envSchema.parse(process.env);

export default {
    schema: './src/schema/index.ts',
    out: './migrations',
    host: env.DB_HOST,
    user: env.DB_USERNAME,
    password: env.DB_PASSWORD,
    database: env.DB_NAME,
} satisfies Config;
