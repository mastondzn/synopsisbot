import { captureException } from '@sentry/node';

import { defineEventHandler } from '~/helpers/event';

export default defineEventHandler({
    event: 'error',
    handler: (error) => {
        console.error(error);
        captureException(error);
    },
});
