import chalk from 'chalk';

import { type BotScript } from '~/types/scripts';
import { wait } from '~/utils/wait';

export const script: BotScript = {
    description: '',
    type: 'bot',
    run: async ({ bot }) => {
        const streams: string[] = [];
        const firstCursor = await bot.api.streams
            .getStreams({
                limit: 100,
            })
            .then((res) => {
                streams.push(...res.data.map((stream) => stream.userName));
                return res.cursor;
            });

        if (!firstCursor) throw new Error('No cursor found');

        const secondCursor = await bot.api.streams
            .getStreams({
                limit: 100,
                after: firstCursor,
            })
            .then((res) => {
                streams.push(...res.data.map((stream) => stream.userName));
                return res.cursor;
            });

        if (!secondCursor) throw new Error('No cursor found');

        await bot.api.streams
            .getStreams({
                limit: 100,
                after: secondCursor,
            })
            .then((res) => {
                streams.push(...res.data.map((stream) => stream.userName));
            });

        console.log(streams);

        bot.chat.registerEvent({
            event: 'onJoin',
            handler: (channel) => {
                console.log(`Joined ${channel}`);
            },
        });

        bot.chat.registerEvent({
            event: 'onMessage',
            handler: (channel, user, message, msg) => {
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

        await bot.chat.joinAll(streams);
        await wait(3 * 60 * 1000);
    },
};
