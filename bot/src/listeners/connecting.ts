import { createEventHandler } from '~/helpers/event';
import { logger } from '~/helpers/logger';

export default createEventHandler({
    event: 'connecting',
    handler: () => logger.init('connecting to chat'),
});
