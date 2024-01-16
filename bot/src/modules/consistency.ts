import { env } from '@synopsis/env/node';
import { CronJob } from 'cron';

import { defineModule } from '~/helpers/module';
import { chat } from '~/services/chat';

export default defineModule({
    name: 'consistency',
    register: () => {
        if (env.NODE_ENV !== 'production') return;

        CronJob.from({
            // every 5 minutes
            cronTime: '*/5 * * * *',
            onTick: () => {
                void chat.say(env.TWITCH_BOT_OWNER_USERNAME, 'consistency check');
            },
            start: true,
        });

        console.log('[module:consistency] started');
    },
});
