import { type BotModule } from '~/types/client';

let latency: number | null = null;
export const getLatency = (): number | null => latency;

let timer: NodeJS.Timer | null = null;
export const clearTimer = (): void => {
    if (timer) timer.unref();
};

export const module: BotModule = {
    name: 'latency',
    register: ({ client }) => {
        const chatClient = client.getShardById(0);
        if (!chatClient) {
            console.warn('[module:latency]: no initial client found.');
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

                if (!latency) {
                    console.log(
                        `[module:latency]: Reported first latency of ${Date.now() - now}ms`
                    );
                }
                latency = Date.now() - now;
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
