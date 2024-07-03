import { env } from '@synopsis/env/node';

import { create } from '~/helpers/creators';
import { logger } from '~/helpers/logger';

export default create.listener({
    event: 'PART',
    listener: (message) => {
        if (message.partedUsername !== env.TWITCH_BOT_USERNAME) {
            return;
        }

        logger.parts(`${message.partedUsername} parted ${message.channelName}`);
    },
});
