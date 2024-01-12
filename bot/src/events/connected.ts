import type { BotEventHandler } from '~/types/client';

export const event: BotEventHandler = {
    event: 'connect',
    handler: () => {
        console.log('[events:tests] connected to chat');
    },
};
