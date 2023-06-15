import { env } from '@synopsis/env';

export const getUrl = () => {
    return env.NODE_ENV === 'production'
        ? `https://bot.${env.DOMAIN_NAME}`
        : `http://localhost:${process.env.PORT ?? 3000}`;
};
