import chalk from 'chalk';

import { type BotModule } from '~/types/client';

let latency: number | null = null;
export const getLatency = (): number | null => latency;

const logPrefix = chalk.bgCyan('[module:latency]');

export const module: BotModule = {
    name: 'latency',
    register: ({ chat }) => {
        const shard = chat.getShardById(0);
        if (!shard) {
            console.error(`${logPrefix} no initial client found.`);
            return;
        }

        const ping = () => {
            const now = Date.now();

            const handler = shard.irc.onAnyMessage((message) => {
                if (message.params['message'] !== now.toString(10)) return;
                latency = Date.now() - now;
                console.log(`${logPrefix} received latency: ${latency}ms`);
                shard.irc.removeListener(handler);
            });

            shard.irc.sendRaw(`PING :${now}`);
        };

        shard.onAuthenticationSuccess(() => {
            setTimeout(ping, 1000 * 8);
            setInterval(ping, 1000 * 60 * 5);
        });
    },
};
