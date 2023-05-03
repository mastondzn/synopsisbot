import chalk from 'chalk';

import { channels as channelsTable } from '@synopsis/db';

import { type BotModule } from '~/types/client';

const logPrefix = chalk.bgBlue('[modules:channels]');

export const module: BotModule = {
    name: 'channels',
    priority: 5,
    register: async ({ db, api, chat }) => {
        const allChannels = await db
            .select({ twitchId: channelsTable.twitchId })
            .from(channelsTable);

        const channelIds = allChannels.map(({ twitchId }) => twitchId);

        const channels = await api.users
            .getUsersByIds(channelIds)
            .then((res) => res.map(({ name }) => name));

        if (channels.length !== channelIds.length) {
            console.warn(
                logPrefix,
                `missing ${channelIds.length - channels.length} channels after api call`
            );
        }

        console.log(logPrefix, `joining ${channels.length} channels`);
        await chat.joinAll(channels);
    },
};
