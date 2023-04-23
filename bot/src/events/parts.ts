import chalk from 'chalk';

import { type BotEventHandler } from '~/types/client';
import { env } from '~/utils/env';

export const event: BotEventHandler = {
    event: 'onPart',
    handler: ({ params: [channel, userName] }) => {
        if (userName !== env.TWITCH_BOT_USERNAME) return;
        console.log(`${chalk.bgBlueBright('[events:parts]')} ${userName} parted ${channel}`);
    },
};
