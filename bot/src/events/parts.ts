import chalk from 'chalk';

import { env } from '@synopsis/env';

import { type BotEventHandler } from '~/types/client';

export const event: BotEventHandler = {
    event: 'PART',
    handler: ({ params: [msg] }) => {
        if (msg.partedUsername !== env.TWITCH_BOT_USERNAME) return;

        console.log(
            chalk.bgBlueBright('[events:parts]'),
            `${msg.partedUsername} parted ${msg.channelName}`
        );
    },
};
