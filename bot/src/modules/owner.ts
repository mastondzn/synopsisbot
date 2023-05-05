import { env } from '@synopsis/env/node';

import { type BotModule } from '~/types/client';

export const module: BotModule = {
    name: 'owner',
    description: 'sets the owner as a owner in the permissions provider',
    priority: 35,
    register: async ({ utils: { permissions } }) => {
        await permissions.setGlobalPermission('owner', env.TWITCH_BOT_OWNER_ID);
    },
};
