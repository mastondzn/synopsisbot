import { defineEventHandler } from '~/helpers/event';

export default defineEventHandler({
    event: 'connect',
    handler: () => console.log('[events:tests] connected to chat'),
});
