/* eslint-disable turbo/no-undeclared-env-vars */
// eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars
import { createEnv } from '@t3-oss/env-nextjs';

import { publicEnvSchema, serverEnvSchema } from './schemas';

export const env = createEnv({
    server: serverEnvSchema.shape,
    client: publicEnvSchema.shape,

    runtimeEnv: {
        NODE_ENV: process.env['NODE_ENV'],
        DB_HOST: process.env['DB_HOST'],
        DB_NAME: process.env['DB_NAME'],
        DB_PASSWORD: process.env['DB_PASSWORD'],
        DB_USERNAME: process.env['DB_USERNAME'],
        REDIS_HOST: process.env['REDIS_HOST'],
        REDIS_PASSWORD: process.env['REDIS_PASSWORD'],
        TWITCH_BOT_ID: process.env['TWITCH_BOT_ID'],
        TWITCH_BOT_USERNAME: process.env['TWITCH_BOT_USERNAME'],
        TWITCH_CLIENT_ID: process.env['TWITCH_CLIENT_ID'],
        TWITCH_CLIENT_SECRET: process.env['TWITCH_CLIENT_SECRET'],
        TWITCH_BOT_OWNER_ID: process.env['TWITCH_BOT_OWNER_ID'],
        TWITCH_BOT_OWNER_USERNAME: process.env['TWITCH_BOT_OWNER_USERNAME'],
        DOMAIN_NAME: process.env['DOMAIN_NAME'],

        NEXT_PUBLIC_TWITCH_BOT_ID: process.env['NEXT_PUBLIC_TWITCH_BOT_ID'],
        NEXT_PUBLIC_TWITCH_BOT_USERNAME: process.env['NEXT_PUBLIC_TWITCH_BOT_USERNAME'],
        NEXT_PUBLIC_TWITCH_CLIENT_ID: process.env['NEXT_PUBLIC_TWITCH_CLIENT_ID'],
        NEXT_PUBLIC_DOMAIN_NAME: process.env['NEXT_PUBLIC_DOMAIN_NAME'],
    },
});

export type Env = typeof env;
