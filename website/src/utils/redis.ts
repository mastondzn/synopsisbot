import { Redis } from 'ioredis';

import { env } from '@synopsis/env';

let cachedRedis: Redis | undefined;

export const getRedis = (): Redis => {
    if (!cachedRedis) {
        cachedRedis = new Redis({
            host: env.REDIS_HOST,
            password: env.REDIS_PASSWORD,
        });
    }
    return cachedRedis;
};
