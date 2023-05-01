import isDocker from 'is-docker';
import { z } from 'zod';

export const serverEnvSchema = z.object({
    NODE_ENV: z.enum(['development', 'production', 'test']),

    TWITCH_CLIENT_ID: z.string(),
    TWITCH_CLIENT_SECRET: z.string(),
    TWITCH_BOT_USERNAME: z.string(),
    TWITCH_BOT_ID: z.string(),

    TWITCH_BOT_OWNER_USERNAME: z.string(),
    TWITCH_BOT_OWNER_ID: z.string(),

    DB_HOST: z
        .string()
        .default('localhost')
        .transform((host) => (host === 'localhost' ? (isDocker() ? 'db' : host) : host)),
    DB_USERNAME: z.string(),
    DB_PASSWORD: z.string(),
    // the name of the database, not the username
    DB_NAME: z.string(),

    REDIS_HOST: z
        .string()
        .default('localhost')
        .transform((host) => (host === 'localhost' ? (isDocker() ? 'cache' : host) : host)),
    REDIS_PASSWORD: z.string(),

    DOMAIN_NAME: z.string(),
});

export const publicEnvSchema = z.object({
    NEXT_PUBLIC_TWITCH_CLIENT_ID: z.string(),
    NEXT_PUBLIC_TWITCH_BOT_USERNAME: z.string(),
    NEXT_PUBLIC_TWITCH_BOT_ID: z.string(),
    NEXT_PUBLIC_DOMAIN_NAME: z.string(),
});

export const envSchema = z.object({ ...serverEnvSchema.shape, ...publicEnvSchema.shape });

export type ServerEnv = z.infer<typeof serverEnvSchema>;
export type PublicEnv = z.infer<typeof publicEnvSchema>;
export type Env = z.infer<typeof envSchema>;
