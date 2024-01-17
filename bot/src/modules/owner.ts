import { env } from '@synopsis/env/node';

import { defineModule } from '~/helpers/module/define';
import { permissions } from '~/providers/permissions';

export default defineModule({
    name: 'owner',
    description: 'sets the owner as a owner in the permissions provider',
    priority: 35,
    register: async () => {
        await permissions.setGlobalPermission('owner', {
            user: {
                id: env.TWITCH_BOT_OWNER_ID,
                login: env.TWITCH_BOT_OWNER_USERNAME,
            },
        });
    },
});
