import { defineEventHandler } from '~/helpers/event';
import { prefixes } from '~/helpers/log-prefixes';

export default defineEventHandler({
    event: 'JOIN',
    handler: (message) => {
        console.log(
            prefixes.joins,
            `${message.joinedUsername} joined ${message.channelName}`,
        );
    },
});
