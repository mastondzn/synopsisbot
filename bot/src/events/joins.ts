import chalk from 'chalk';

import { env } from '@synopsis/env/node';

import { type BotEventHandler } from '~/types/client';

export const event: BotEventHandler = {
    event: 'onJoin',
    handler: ({ params: [channel, userName] }) => {
        if (userName !== env.TWITCH_BOT_USERNAME) return;
        console.log(`${chalk.bgBlueBright('[events:joins]')} ${userName} joined ${channel}`);
    },
};
