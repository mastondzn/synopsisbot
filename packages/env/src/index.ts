import isDocker from 'is-docker';
import { z } from 'zod';

export const envSchema = z.object({
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

export type Env = z.infer<typeof envSchema>;

export const parseEnv = (env: unknown): Env => {
    const parsed = envSchema.safeParse(env);
    if (!parsed.success) {
        console.error(
            Object.entries(parsed.error.flatten().fieldErrors)
                .map(([key, errors]) => `${key}: ${errors.join(', ')}`)
                .join('\n')
        );
        console.error('Failed to parse environment variables.');
        throw new Error('Failed to parse environment variables.');
    }
    return parsed.data;
};
