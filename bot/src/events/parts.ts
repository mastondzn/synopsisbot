import { env } from '@synopsis/env/node';

import { createEventHandler } from '~/helpers/event';
import { logger } from '~/helpers/logger';

export default createEventHandler({
    event: 'PART',
    handler: (message) => {
        if (message.partedUsername !== env.TWITCH_BOT_USERNAME) {
            return;
        }

        logger.parts(`${message.partedUsername} parted ${message.channelName}`);
    },
});
