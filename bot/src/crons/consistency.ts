import { env } from '@synopsis/env/node';

import { defineCron } from '~/helpers/cron/define';
import { chat } from '~/services/chat';

export default defineCron({
    name: 'consistency',
    // every 5 minutes
    cronTime: '*/5 * * * *',
    onTick: async () => {
        if (env.NODE_ENV !== 'production') return;
        await chat.say(env.TWITCH_BOT_OWNER_USERNAME, 'consistency check');
    },
});
