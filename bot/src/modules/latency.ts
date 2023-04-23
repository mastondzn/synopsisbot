import chalk from 'chalk';

import { type BotModule } from '~/types/client';

let latency: number | null = null;
export const getLatency = (): number | null => latency;

const logPrefix = chalk.bgCyan('[module:latency]');

export const module: BotModule = {
    name: 'latency',
    register: ({ chat }) => {
        chat.on('spawn', (shard) => {
            const ping = () => {
                const now = Date.now();

                let success = false;
                const handler = shard.irc.onAnyMessage((message) => {
                    if (message.params['message'] !== now.toString(10)) return;
                    latency = Date.now() - now;
                    success = true;
                    console.log(
                        `${logPrefix} received latency: ${latency}ms on shard ${shard.shardId}`
                    );
                    shard.irc.removeListener(handler);
                });

                setTimeout(() => {
                    if (success) return;
                    console.error(`${logPrefix} latency check timed out.`);
                    shard.irc.removeListener(handler);
                }, 2 * 1000);

                shard.irc.sendRaw(`PING :${now}`);
            };

            shard.onAuthenticationSuccess(() => {
                setTimeout(ping, 1000 * 8);
                setInterval(ping, 1000 * 60 * 5);
            });
        });
    },
};
