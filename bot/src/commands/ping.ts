import ms from 'pretty-ms';

import { getLatency } from '~/modules/latency';
import { type BotCommand } from '~/types/client';

const startedAt = new Date();

export const command: BotCommand = {
    name: 'ping',
    description: 'Replies with pong! To ensure the bot is alive.',
    aliases: ['pong'],
    run: ({ params }) => {
        const lines = [];

        if (params.command === 'pong') lines.push('MrDestructoid Ping!');
        else lines.push('MrDestructoid Pong!');

        const latency = getLatency();
        if (latency) lines.push(`Latency is ${latency}ms.`);

        lines.push(
            `Uptime is ${ms(Date.now() - startedAt.getTime(), {
                unitCount: 2,
                secondsDecimalDigits: 0,
            })}.`
        );

        return { reply: lines.join(' ') };
    },
};
