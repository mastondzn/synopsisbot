import { create } from '~/helpers/creators';
import { logger } from '~/helpers/logger';

export default create.listener({
    event: 'JOIN',
    listener: (message) => logger.joins(`${message.joinedUsername} joined ${message.channelName}`),
});
