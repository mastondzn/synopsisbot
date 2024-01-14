import type { ChatClient } from '@kararty/dank-twitch-irc';
import ms from 'pretty-ms';

import { defineCommand } from '~/helpers/command';
import { chat } from '~/services/chat';

const startedAt = new Date();

async function getLatency(chat: ChatClient) {
    const now = Date.now();
    await chat.ping();
    return Date.now() - now;
}

export default defineCommand({
    name: 'ping',
    description: 'Replies with pong! To ensure the bot is alive.',
    aliases: ['pong'],
    run: async ({ parameters }) => {
        const lines = [];

        if (parameters.command === 'pong') {
            lines.push('MrDestructoid Ping!');
        } else {
            lines.push('MrDestructoid Pong!');
        }

        const latency = await getLatency(chat);

        lines.push(
            `Latency is ${latency}ms.`,
            `Uptime is ${ms(Date.now() - startedAt.getTime(), {
                unitCount: 2,
                secondsDecimalDigits: 0,
            })}.`,
        );

        return { reply: lines.join(' ') };
    },
});
