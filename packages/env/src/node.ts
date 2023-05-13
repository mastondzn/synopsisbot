import { resolve } from 'node:path';

import { createEnv } from '@t3-oss/env-core';
import { config } from 'dotenv';

import { publicEnvSchema, serverEnvSchema } from './schemas';

config({ path: resolve(process.cwd(), '../.env') });

export const env = createEnv({
    clientPrefix: 'NEXT_PUBLIC_',

    server: serverEnvSchema.shape,
    client: publicEnvSchema.shape,

    skipValidation:
        !!process.env['SKIP_ENV_VALIDATION'] &&
        process.env['SKIP_ENV_VALIDATION'] !== 'false' &&
        process.env['SKIP_ENV_VALIDATION'] !== '0',

    runtimeEnv: process.env,
});
