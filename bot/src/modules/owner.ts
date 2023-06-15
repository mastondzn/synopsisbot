import { env } from '@synopsis/env';

import { type BotModule } from '~/types/client';

export const module: BotModule = {
    name: 'owner',
    description: 'sets the owner as a owner in the permissions provider',
    priority: 35,
    register: async ({ utils: { permissions } }) => {
        await permissions.setGlobalPermission('owner', {
            user: {
                id: env.TWITCH_BOT_OWNER_ID,
                login: env.TWITCH_BOT_OWNER_USERNAME,
            },
        });
    },
};
