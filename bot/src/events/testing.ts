import { type BotEventHandler } from '~/types/client';

export const event: BotEventHandler = {
    event: 'onConnect',
    handler: (ctx) => {
        console.log('onConnect');
    },
};
