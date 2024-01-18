import { defineEventHandler } from '~/helpers/event';
import { prefixes } from '~/helpers/log-prefixes';

export default defineEventHandler({
    event: 'connect',
    handler: () => console.log(prefixes.init, 'connected to chat'),
});
