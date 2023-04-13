import chalk from 'chalk';

import { type BotScript } from '~/types/scripts';
import { wait } from '~/utils/wait';

export const script: BotScript = {
    description: '',
    type: 'bot',
    run: async ({ bot }) => {
        const streams: string[] = [];

        let cursor: string | null = '';
        let viewers = 0;
        for (let i = 0; i < 5; i++) {
            if (i !== 0 && !cursor) break;
            const options = cursor ? { after: cursor, limit: 100 } : { limit: 100 };
            const res = await bot.api.streams.getStreams(options);
            cursor = res.cursor || null;
            streams.push(...res.data.map((stream) => stream.userName));
            viewers += res.data.reduce((acc, stream) => acc + stream.viewers, 0);
        }

        console.log(`Total viewers: ${viewers}`);
        console.log(streams);

        bot.chat.registerEvent({
            event: 'onJoin',
            handler: (channel) => {
                console.log(chalk.bgCyan(`Joined ${channel}`));
            },
        });

        bot.chat.registerEvent({
            event: 'onMessage',
            handler: (channel, user, message) => {
                console.log(`[${chalk.blue(channel)}] ${user}: ${message}`);
            },
        });

        setInterval(() => {
            console.log(
                chalk.yellow(
                    `CURRENTLY JOINED TO ${bot.chat.currentChannels.length} CHANNELS WITH ${bot.chat.clients.size} SHARDS`
                )
            );
        }, 500);

        await bot.chat.join(streams);
        await wait(3 * 60 * 1000);
    },
};
