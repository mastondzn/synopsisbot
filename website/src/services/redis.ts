import { env } from '@synopsis/env/next';
import { Redis } from 'ioredis';
import isDocker from 'is-docker';

export const cache = new Redis({
    host: isDocker() ? 'cache' : 'localhost',
    password: env.REDIS_PASSWORD,
});
