import { type ChatClient } from '@kararty/dank-twitch-irc';
import ms from 'pretty-ms';

import { type BotCommand } from '~/types/client';

const startedAt = new Date();

const getLatency = async (chat: ChatClient) => {
    const now = Date.now();
    await chat.ping();
    return Date.now() - now;
};

export const command: BotCommand = {
    name: 'ping',
    description: 'Replies with pong! To ensure the bot is alive.',
    aliases: ['pong'],
    run: async ({ params, chat }) => {
        const lines = [];

        if (params.command === 'pong') lines.push('MrDestructoid Ping!');
        else lines.push('MrDestructoid Pong!');

        const latency = await getLatency(chat);

        lines.push(
            `Latency is ${latency}ms.`,
            `Uptime is ${ms(Date.now() - startedAt.getTime(), {
                unitCount: 2,
                secondsDecimalDigits: 0,
            })}.`
        );

        return { reply: lines.join(' ') };
    },
};
