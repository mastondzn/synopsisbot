import { channels } from '@synopsis/db';
import { env } from '@synopsis/env/node';

import type { BotModule } from '~/types/client';

export const module: BotModule = {
    name: 'default-channels',
    description: 'sets default channels in db if they don\'t exist',
    priority: 30,
    register: async ({ db }) => {
        await db
            .insert(channels)
            .values([
                {
                    mode: 'all',
                    twitchId: env.TWITCH_BOT_OWNER_ID,
                    twitchLogin: env.TWITCH_BOT_OWNER_USERNAME,
                },
                {
                    mode: 'all',
                    twitchId: env.TWITCH_BOT_ID,
                    twitchLogin: env.TWITCH_BOT_USERNAME,
                },
            ])
            .onConflictDoNothing();
    },
};
