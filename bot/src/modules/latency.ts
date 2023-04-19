import chalk from 'chalk';

import { type BotModule } from '~/types/client';

let latency: number | null = null;
export const getLatency = (): number | null => latency;

let timer: NodeJS.Timer | null = null;
export const clearTimer = (): void => {
    if (timer) clearInterval(timer);
};

const logPrefix = chalk.bgCyan('[module:latency]');

export const module: BotModule = {
    name: 'latency',
    register: ({ chat }) => {
        const shard = chat.getShardById(0);
        if (!shard) {
            console.error(`${logPrefix} no initial client found.`);
            return;
        }

        const pingCheck = () => {
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
            setTimeout(pingCheck, 1000 * 8);
            timer = setInterval(pingCheck, 1000 * 60 * 5);
        });
    },
};
