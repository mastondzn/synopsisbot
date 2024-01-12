import type { BotEventHandler } from '~/types/client';

export const event: BotEventHandler = {
    event: 'error',
    handler: ({ params: [error] }) => console.error(error),
};
