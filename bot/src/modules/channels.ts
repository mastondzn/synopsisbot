import chalk from 'chalk';

import { channels as channelsTable } from '@synopsis/db';

import { type BotModule } from '~/types/client';
import { env } from '~/utils/env';

const logPrefix = chalk.bgBlue('[modules:channels]');

export const module: BotModule = {
    name: 'channels',
    register: async ({ db, api, chat }) => {
        // if (env.NODE_ENV !== 'production') return;
        const allChannels = await db
            .select({ twitchId: channelsTable.twitchId })
            .from(channelsTable);

        const channelIds = allChannels.map(({ twitchId }) => twitchId);

        let channels = await api.users
            .getUsersByIds(channelIds)
            .then((res) => res.map(({ name }) => name));

        if (channels.length !== channelIds.length) {
            console.warn(
                logPrefix,
                `missing ${channelIds.length - channels.length} channels after api call`
            );
        }

        channels = [
            ...new Set([env.TWITCH_BOT_OWNER_USERNAME, env.TWITCH_BOT_USERNAME, ...channels]),
        ];

        console.log(logPrefix, `joining ${channels.length} channels`);
        await chat.join(channels);
    },
};
