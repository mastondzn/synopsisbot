import { captureException } from '@sentry/node';

import { createEventHandler } from '~/helpers/event';

export default createEventHandler({
    event: 'error',
    handler: (error) => {
        console.error(error);
        captureException(error);
    },
});
