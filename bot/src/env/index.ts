import { resolve } from 'node:path';

import { config } from 'dotenv';

import { envSchema } from './schema';
export * from './schema';

config({ path: resolve(process.cwd(), '../.env') });

const parsed = envSchema.safeParse(process.env);
if (!parsed.success) {
    console.error(
        Object.entries(parsed.error.flatten().fieldErrors)
            .map(([key, errors]) => `${key}: ${errors.join(', ')}`)
            .join('\n')
    );
    console.error('Failed to parse environment variables.');
    throw new Error('Failed to parse environment variables.');
}

export const env = parsed.data;
