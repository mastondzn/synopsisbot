import type { BotEventHandler } from '~/types/client';

export const event: BotEventHandler = {
    event: 'connecting',
    handler: () => {
        console.log('[events:tests] connecting to chat');
    },
};
