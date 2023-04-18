import { Redis } from 'ioredis';

import { type ServerEnv } from '@synopsis/env';

export const makeCache = (env: ServerEnv): Redis => {
    return new Redis({
        host: env.REDIS_HOST,
        password: env.REDIS_PASSWORD,
    });
};
