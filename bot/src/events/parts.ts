import { env } from '@synopsis/env/node';

import { createEventHandler } from '~/helpers/event';
import { prefixes } from '~/helpers/log-prefixes';

export default createEventHandler({
    event: 'PART',
    handler: (message) => {
        if (message.partedUsername !== env.TWITCH_BOT_USERNAME) {
            return;
        }

        console.log(prefixes.parts, `${message.partedUsername} parted ${message.channelName}`);
    },
});
