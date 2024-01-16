import { env } from '@synopsis/env/node';

import { defineEventHandler } from '~/helpers/event';

export default defineEventHandler({
    event: 'JOIN',
    handler: (message) => {
        if (message.joinedUsername !== env.TWITCH_BOT_USERNAME) return;
        console.log(
            `[events:joins] ${message.joinedUsername} joined ${message.channelName}`,
        );
    },
});
