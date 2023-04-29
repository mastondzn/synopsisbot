import ms from 'pretty-ms';

import { getLatency } from '~/modules/latency';
import { type BotCommand } from '~/types/client';

const startedAt = new Date();

export const command: BotCommand = {
    name: 'ping',
    description: 'Replies with pong! To ensure the bot is alive.',
    run: async ({ reply }) => {
        const lines = [`pong 🏓!`];

        const latency = getLatency();
        if (latency) lines.push(`Latency is ${latency}ms.`);

        lines.push(`Uptime is ${ms(Date.now() - startedAt.getTime(), { unitCount: 3 })}.`);

        return await reply(lines.join(' '));
    },
};
