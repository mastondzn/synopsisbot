import ms from 'pretty-ms';

import { create } from '~/helpers/creators';
import { trim } from '~/helpers/tags';
import { chat } from '~/services/chat';

export default create.command({
    name: 'ping',
    description: 'Replies with pong! To ensure the bot is alive.',
    aliases: ['pong'],
    run: async ({ parameters: { command } }) => {
        return {
            reply: trim`
                🏓 ${command === 'pong' ? 'Ping' : 'Pong'}!
                Uptime is ${ms(process.uptime() * 1000, { unitCount: 2, secondsDecimalDigits: 0 })}.
                Latency is ${await chat.getLatency()}ms.
                Memory usage is ${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB.
            `,
        };
    },
});
