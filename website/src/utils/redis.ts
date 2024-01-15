import { env } from '@synopsis/env/next';
import { Redis } from 'ioredis';

let cachedRedis: Redis | undefined;

export function getRedis(): Redis {
    if (!cachedRedis) {
        cachedRedis = new Redis({
            host: env.REDIS_HOST,
            password: env.REDIS_PASSWORD,
        });
    }
    return cachedRedis;
}
