import { env } from '@synopsis/env/node';
import chalk from 'chalk';

import type { BotEventHandler } from '~/types/client';

export const event: BotEventHandler = {
    event: 'PART',
    handler: ({ params: [message] }) => {
        if (message.partedUsername !== env.TWITCH_BOT_USERNAME) { return; }

        console.log(
            chalk.bgBlueBright('[events:parts]'),
            `${message.partedUsername} parted ${message.channelName}`,
        );
    },
};
