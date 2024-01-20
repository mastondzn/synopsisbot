/* eslint-disable unicorn/prevent-abbreviations */
import { env } from '@synopsis/env/node';

import { defineCron } from '../helpers/cron/define';
import { jfetch } from '~/helpers/fetch';
import { prefixes } from '~/helpers/log-prefixes';

export default defineCron({
    name: 'dev-announce',
    // every 2 minutes
    cronTime: '*/2 * * * *',
    onTick: async () => {
        if (env.NODE_ENV !== 'development') return;

        const { response } = await jfetch({
            url: `https://bot.${env.DOMAIN_NAME}/api/dev-announce`,
            method: 'POST',
            headers: {
                Authorization: `Bearer ${env.APP_SECRET}`,
                'Content-Type': 'application/json',
            },
            body: { announce_for: 120 },
        });

        if ('error' in response) {
            console.error(prefixes['dev-announce'], 'failed to fetch');
            console.error(prefixes['dev-announce'], response.error);
            return;
        }

        if (!response.ok) {
            console.error(prefixes['dev-announce'], 'failed to announce dev mode to remote server');
            return;
        }

        console.log(prefixes['dev-announce'], 'announced dev mode to remote server');
    },
});
