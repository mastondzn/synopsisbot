import { env } from '@synopsis/env/node';

import { defineEventHandler } from '~/helpers/event';
import { prefixes } from '~/helpers/log-prefixes';

export default defineEventHandler({
    event: 'PART',
    handler: (message) => {
        if (message.partedUsername !== env.TWITCH_BOT_USERNAME) {
            return;
        }

        console.log(prefixes.parts, `${message.partedUsername} parted ${message.channelName}`);
    },
});
