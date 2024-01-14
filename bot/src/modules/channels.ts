import chalk from 'chalk';

import { defineModule } from '~/helpers/module';
import { api } from '~/services/api';
import { chat } from '~/services/chat';
import { db } from '~/services/database';

const logPrefix = chalk.bgBlue('[modules:channels]');

export default defineModule({
    name: 'channels',
    priority: 5,
    register: async () => {
        const allChannels = await db.query.channels.findMany({
            columns: { twitchId: true },
        });

        const channelIds = allChannels.map(({ twitchId }) => twitchId);

        const channels = await api.helix.users
            .getUsersByIds(channelIds)
            .then(response => response.map(({ name }) => name));

        if (channels.length !== channelIds.length) {
            console.warn(
                logPrefix,
                `missing ${channelIds.length - channels.length} channels after api call`,
            );
        }

        console.log(logPrefix, `joining ${channels.length} channels`);
        await chat.joinAll(channels);
    },
});
