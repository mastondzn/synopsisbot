import { channels } from '@synopsis/db';

import { type BotModule } from '~/types/client';
import { env } from '~/utils/env';

export const module: BotModule = {
    name: 'default-channels',
    description: "sets default channels in db if they don't exist",
    register: async ({ db }) => {
        await db
            .insert(channels)
            .values([
                {
                    mode: 'all',
                    twitchId: env.TWITCH_BOT_OWNER_ID,
                    twitchLogin: env.TWITCH_BOT_OWNER_USERNAME,
                },
                { mode: 'all', twitchId: env.TWITCH_BOT_ID, twitchLogin: env.TWITCH_BOT_USERNAME },
            ])
            .onConflictDoNothing();
    },
};
