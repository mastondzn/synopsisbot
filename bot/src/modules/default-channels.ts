import { type Prisma } from '@synopsis/db';
import { env } from '@synopsis/env';

import { type BotModule } from '~/types/client';

export const module: BotModule = {
    name: 'default-channels',
    description: "sets default channels in db if they don't exist",
    priority: 30,
    register: async ({ db }) => {
        const channels = [
            { twitchId: env.TWITCH_BOT_OWNER_ID, twitchLogin: env.TWITCH_BOT_OWNER_USERNAME },
            { twitchId: env.TWITCH_BOT_ID, twitchLogin: env.TWITCH_BOT_USERNAME },
        ];

        const channelsToUpsert: Prisma.ChannelUpsertArgs[] = channels.map((channel) => {
            return {
                where: { twitchId: channel.twitchId },
                create: { ...channel, mode: 'ALL' },
                update: { ...channel, mode: 'ALL' },
            };
        });

        await db.$transaction(channelsToUpsert.map((args) => db.channel.upsert(args)));
    },
};
