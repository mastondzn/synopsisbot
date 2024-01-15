import { defineEventHandler } from '~/helpers/event';

export default defineEventHandler({
    event: 'connecting',
    handler: () => console.log('[events:tests] connecting to chat'),
});
