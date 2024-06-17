import ms from 'pretty-ms';

import { createCommand } from '~/helpers/command/define';
import { trim } from '~/helpers/tags';
import { chat } from '~/services/chat';

export default createCommand({
    name: 'ping',
    description: 'Replies with pong! To ensure the bot is alive.',
    aliases: ['pong'],
    run: async ({ parameters: { command } }) => {
        return {
            reply: trim`
                MrDestructoid ${command === 'pong' ? 'Ping' : 'Pong'}!
                Uptime is ${ms(process.uptime() * 1000, { unitCount: 2, secondsDecimalDigits: 0 })}.
                Latency is ${await chat.getLatency()}ms.
            `,
        };
    },
});
