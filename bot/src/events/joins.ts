import { env } from '@synopsis/env/node';
import chalk from 'chalk';

import { defineEventHandler } from '~/helpers/event';

export default defineEventHandler({
    event: 'JOIN',
    handler: (message) => {
        if (message.joinedUsername !== env.TWITCH_BOT_USERNAME) return;
        console.log(
            `${chalk.bgBlueBright('[events:joins]')} ${message.joinedUsername} joined ${
                message.channelName
            }`,
        );
    },
});
