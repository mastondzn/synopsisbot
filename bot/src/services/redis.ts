import { env } from '@synopsis/env/node';
import { Redis } from 'ioredis';

export const cache = new Redis({
    host: env.REDIS_HOST,
    password: env.REDIS_PASSWORD,
});
