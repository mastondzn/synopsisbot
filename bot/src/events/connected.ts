import { createEventHandler } from '~/helpers/event';
import { prefixes } from '~/helpers/log-prefixes';

export default createEventHandler({
    event: 'connect',
    handler: () => console.log(prefixes.init, 'connected to chat'),
});
