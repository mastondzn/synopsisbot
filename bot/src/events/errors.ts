import { error } from 'node:console';

import { type BotEventHandler } from '~/types/client';

export const event: BotEventHandler = {
    event: 'error',
    handler: () => console.error(error),
};
