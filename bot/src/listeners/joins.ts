import { createEventHandler } from '~/helpers/event';
import { logger } from '~/helpers/logger';

export default createEventHandler({
    event: 'JOIN',
    handler: (message) => logger.joins(`${message.joinedUsername} joined ${message.channelName}`),
});
