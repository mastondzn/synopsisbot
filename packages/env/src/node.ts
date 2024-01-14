/// <reference types="node" />

import { createEnv } from '@t3-oss/env-core';

import { publicEnvironmentSchema, serverEnvironmentSchema } from './schemas';

// eslint-disable-next-line unicorn/prevent-abbreviations
export const env = createEnv({
    server: serverEnvironmentSchema.shape,
    client: publicEnvironmentSchema.shape,

    runtimeEnv: process.env,
    clientPrefix: 'NEXT_PUBLIC_',

    skipValidation:
        process.env['NODE_ENV'] === 'test'
        || (process.env['SKIP_ENV_VALIDATION']?.length
            ? !['0', 'false'].includes(process.env['SKIP_ENV_VALIDATION'])
            : true),
});
