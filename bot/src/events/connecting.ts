import { createEventHandler } from '~/helpers/event';
import { prefixes } from '~/helpers/log-prefixes';

export default createEventHandler({
    event: 'connecting',
    handler: () => console.log(prefixes.init, 'connecting to chat'),
});
