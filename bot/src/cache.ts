import { Redis } from 'ioredis';

import { type Env } from './env';

export const makeCache = (env: Env): Redis => {
    return new Redis({
        host: env.REDIS_HOST,
        password: env.REDIS_PASSWORD,
    });
};
