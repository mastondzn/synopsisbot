import { create } from '~/helpers/creators';
import { logger } from '~/helpers/logger';

export default create.listener({
    event: 'connecting',
    listener: () => logger.init('connecting to chat'),
});
