import { captureException } from '@sentry/node';

import { create } from '~/helpers/creators';

export default create.listener({
    event: 'error',
    listener: (error) => {
        console.error(error);
        captureException(error);
    },
});
