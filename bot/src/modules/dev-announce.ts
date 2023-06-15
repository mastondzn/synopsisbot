import chalk from 'chalk';

import { env } from '@synopsis/env';

import { type BotModule } from '~/types/client';

const logPrefix = chalk.bgGreenBright('[module:dev-announce]');

export const module: BotModule = {
    name: 'dev-announce',
    description: 'Announces the process is running in dev mode locally, to the remote server.',
    register: () => {
        if (env.NODE_ENV !== 'development') return;
        const interval = 2 * 60 * 1000;

        const announce = async () => {
            const res = await fetch(`https://bot.${env.DOMAIN_NAME}/api/dev-announce`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${env.APP_SECRET}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ announce_for: interval / 1000 }),
            }).catch((error) => ({
                error: error instanceof Error ? error.message : 'unknown error',
            }));

            if ('error' in res) {
                console.error(logPrefix, 'Failed to fetch');
                console.error(logPrefix, res.error);
                return;
            }

            if (!res.ok) {
                console.error(logPrefix, 'Failed to announce dev mode to remote server');
                return;
            }

            console.log(logPrefix, 'Announced dev mode to remote server');
        };

        void announce();
        setInterval(announce, interval);
    },
};
