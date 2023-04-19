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
    register: ({ chat: client }) => {
        const chatClient = client.getShardById(0);
        if (!chatClient) {
            console.error(`${logPrefix} no initial client found.`);
            return;
        }

        const pingCheck = () => {
            const now = Date.now();
            const nowString = now.toString(10);

            const handler = chatClient.irc.onAnyMessage((message) => {
                // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
                const rawMessage = (message as unknown as Record<string, unknown>)?.['_raw'];
                if (typeof rawMessage !== 'string') return;
                if (message.params['message'] !== nowString) return;

                latency = Date.now() - now;
                console.log(`${logPrefix} received latency: ${latency}ms`);
                chatClient.irc.removeListener(handler);
            });

            chatClient.irc.sendRaw(`PING :${nowString}`);
        };

        chatClient.onAuthenticationSuccess(() => {
            setTimeout(pingCheck, 1000 * 12);
            timer = setInterval(pingCheck, 1000 * 60 * 5);
        });
    },
};
