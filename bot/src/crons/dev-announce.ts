/* eslint-disable unicorn/prevent-abbreviations */
import { env } from '@synopsis/env/node';

import { createCron } from '../helpers/cron/define';
import { jfetch } from '~/helpers/fetch';
import { prefixes } from '~/helpers/log-prefixes';

export default createCron({
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
        }).catch(() => ({ response: { ok: false } }));

        if (!response.ok) {
            console.error(prefixes.devAnnounce, 'failed to announce dev mode to remote server');
            return;
        }

        console.log(prefixes.devAnnounce, 'announced dev mode to remote server');
    },
});
