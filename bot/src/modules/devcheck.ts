import { type BotModule } from '~/types/client';
import { env } from '~/utils/env';

let bgDevProcess = false;
export const hasDevProcess = () => {
    return bgDevProcess;
};

export const module: BotModule = {
    name: 'dev-check',
    description: 'checks if the bot is also running in dev mode on the current server',
    register: async ({ cache }) => {
        if (env.NODE_ENV === 'development') {
            const setCache = async () => {
                await cache.set('dev-check', 'TRUE', 'EX', 60);
            };

            await setCache();
            setInterval(setCache, 59 * 1000);
        }

        if (env.NODE_ENV === 'production') {
            const checkCache = async () => {
                const res = await cache.get('dev-check');
                bgDevProcess = Boolean(res);
            };

            await checkCache();
            setInterval(checkCache, 59 * 1000);
        }
    },
};
