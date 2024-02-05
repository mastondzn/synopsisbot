import { createEventHandler } from '~/helpers/event';
import { prefixes } from '~/helpers/log-prefixes';

export default createEventHandler({
    event: 'JOIN',
    handler: (message) => {
        console.log(prefixes.joins, `${message.joinedUsername} joined ${message.channelName}`);
    },
});
