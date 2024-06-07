import { createEventHandler } from '~/helpers/event';
import { logger } from '~/helpers/logger';

export default createEventHandler({
    event: 'connect',
    handler: () => logger.init('connected to chat'),
});
