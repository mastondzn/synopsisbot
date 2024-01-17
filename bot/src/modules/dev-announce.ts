// eslint-disable-next-line unicorn/prevent-abbreviations
import { env } from '@synopsis/env/node';

import { setImmediateInterval } from '~/helpers/immediate';
import { defineModule } from '~/helpers/module/define';

export default defineModule({
    name: 'dev-announce',
    description: 'Announces the process is running in dev mode locally, to the remote server.',
    register: () => {
        if (env.NODE_ENV !== 'development') return;

        const interval = 2 * 60 * 1000;

        const announce = async () => {
            const response = await fetch(`https://bot.${env.DOMAIN_NAME}/api/dev-announce`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${env.APP_SECRET}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ announce_for: interval / 1000 }),
            }).catch(error => ({
                error: error instanceof Error ? error.message : 'unknown error',
            }));

            if ('error' in response) {
                console.error('[module:dev-announce]', 'Failed to fetch');
                console.error('[module:dev-announce]', response.error);
                return;
            }

            if (!response.ok) {
                console.error('[module:dev-announce]', 'Failed to announce dev mode to remote server');
                return;
            }

            console.log('[module:dev-announce]', 'Announced dev mode to remote server');
        };

        setImmediateInterval(() => void announce(), interval);
    },
});
