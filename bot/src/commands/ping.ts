import ms from 'pretty-ms';

import { createCommand } from '~/helpers/command';
import { chat } from '~/services';

const startedAt = new Date();

export default createCommand({
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

        const latency = await chat.getLatency();

        lines.push(
            `Latency is ${latency}ms.`,
            `Uptime is ${ms(Date.now() - startedAt.getTime(), {
                unitCount: 2,
                secondsDecimalDigits: 0,
            })}.`,
        );

        return {
            reply: lines.join(' '),
        };
    },
});
