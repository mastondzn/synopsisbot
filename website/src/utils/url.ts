import { env } from '@synopsis/env/next';

export const localUrl =
    env.NODE_ENV === 'production'
        ? `https://bot.${env.DOMAIN_NAME}`
        : `http://localhost:${process.env['PORT'] ?? 3000}`;
