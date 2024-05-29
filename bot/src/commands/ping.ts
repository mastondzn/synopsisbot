import ms from 'pretty-ms';

import { createCommand } from '~/helpers/command';
import { chat } from '~/services';

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

        lines.push(
            `Uptime is ${ms(process.uptime() * 1000, {
                unitCount: 2,
                secondsDecimalDigits: 0,
            })}.`,
            `Latency is ${await chat.getLatency()}ms.`,
        );

        return { reply: lines.join(' ') };
    },
});
