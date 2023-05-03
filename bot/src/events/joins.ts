import chalk from 'chalk';

import { env } from '@synopsis/env/node';

import { type BotEventHandler } from '~/types/client';

export const event: BotEventHandler = {
    event: 'JOIN',
    handler: ({ params: [msg] }) => {
        if (msg.joinedUsername !== env.TWITCH_BOT_USERNAME) return;
        console.log(
            `${chalk.bgBlueBright('[events:joins]')} ${msg.joinedUsername} joined ${
                msg.channelName
            }`
        );
    },
};
