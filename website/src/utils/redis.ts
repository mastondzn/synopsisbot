import { env } from '@synopsis/env/next';
import { Redis } from 'ioredis';
import isDocker from 'is-docker';

let cachedRedis: Redis | undefined;

export function getRedis(): Redis {
    if (!cachedRedis) {
        cachedRedis = new Redis({
            host: isDocker() ? 'cache' : 'localhost',
            password: env.REDIS_PASSWORD,
        });
    }
    return cachedRedis;
}
