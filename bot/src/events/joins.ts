import { env } from '@synopsis/env/node';
import chalk from 'chalk';

import type { BotEventHandler } from '~/types/client';

export const event: BotEventHandler = {
    event: 'JOIN',
    handler: ({ params: [message] }) => {
        if (message.joinedUsername !== env.TWITCH_BOT_USERNAME) { return; }
        console.log(
            `${chalk.bgBlueBright('[events:joins]')} ${message.joinedUsername} joined ${
                message.channelName
            }`,
        );
    },
};
