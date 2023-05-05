import chalk from 'chalk';

import { type BotModule } from '~/types/client';

let latency: number | null = null;
export const getLatency = (): number | null => latency;

const logPrefix = chalk.bgCyan('[module:latency]');

export const module: BotModule = {
    name: 'latency',
    priority: 20,
    register: ({ chat }) => {
        const handshake = async () => {
            const pingStart = Date.now();
            await chat.ping();
            const pingEnd = Date.now();

            latency = pingEnd - pingStart;
        };

        setTimeout(
            () => handshake().catch(() => console.error(logPrefix, 'initial handshake failed')),
            1000 * 5
        );
        setInterval(
            () => handshake().catch(() => console.error(logPrefix, 'handshake failed')),
            1000 * 60 * 2
        );
    },
};
