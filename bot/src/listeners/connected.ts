import { create } from '~/helpers/creators';
import { logger } from '~/helpers/logger';

export default create.listener({
    event: 'connect',
    listener: () => logger.init('connected to chat'),
});
