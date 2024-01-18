import { defineEventHandler } from '~/helpers/event';
import { prefixes } from '~/helpers/log-prefixes';

export default defineEventHandler({
    event: 'connecting',
    handler: () => console.log(prefixes.init, 'connecting to chat'),
});
