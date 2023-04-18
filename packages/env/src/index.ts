import isDocker from 'is-docker';
import { z } from 'zod';

export const serverEnvSchema = z.object({
    NODE_ENV: z.enum(['development', 'production', 'test']),

    TWITCH_CLIENT_ID: z.string(),
    TWITCH_CLIENT_SECRET: z.string(),
    TWITCH_BOT_USERNAME: z.string(),
    TWITCH_BOT_ID: z.string(),

    DB_HOST: z
        .string()
        .default('localhost')
        .transform((host) => (isDocker() ? 'db' : host)),
    DB_USERNAME: z.string(),
    DB_PASSWORD: z.string(),
    // the name of the database, not the username
    DB_NAME: z.string(),

    REDIS_HOST: z
        .string()
        .default('localhost')
        .transform((host) => (isDocker() ? 'cache' : host)),
    REDIS_PASSWORD: z.string(),
});

export const publicEnvSchema = z.object({
    NEXT_PUBLIC_TWITCH_CLIENT_ID: z.string(),
    NEXT_PUBLIC_TWITCH_BOT_USERNAME: z.string(),
    NEXT_PUBLIC_TWITCH_BOT_ID: z.string(),
});

export type ServerEnv = z.infer<typeof serverEnvSchema>;
export type PublicEnv = z.infer<typeof publicEnvSchema>;

export const parseEnv = (env: unknown): ServerEnv => {
    const parsed = serverEnvSchema.safeParse(env);
    if (!parsed.success) {
        const errors = Object.entries(parsed.error.flatten().fieldErrors)
            .map(([key, errors]) => `${key}: ${errors.join(', ')}`)
            .join('\n');
        throw new Error(`${errors}\nFailed to parse environment variables.`);
    }
    return parsed.data;
};
