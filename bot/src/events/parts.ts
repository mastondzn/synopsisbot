import { env } from '@synopsis/env/node';

import { defineEventHandler } from '~/helpers/event';

export default defineEventHandler({
    event: 'PART',
    handler: (message) => {
        if (message.partedUsername !== env.TWITCH_BOT_USERNAME) {
            return;
        }

        console.log(
            `[events:parts] ${message.partedUsername} parted ${message.channelName}`,
        );
    },
});
