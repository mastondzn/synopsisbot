import { Redis } from 'ioredis';

import { env } from '@synopsis/env/next';

export const redis = new Redis({
    host: env.REDIS_HOST,
    password: env.REDIS_PASSWORD,
});
