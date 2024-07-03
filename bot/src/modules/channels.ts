import { create } from '~/helpers/creators';
import { logger } from '~/helpers/logger';
import { helix } from '~/services/apis/helix';
import { chat } from '~/services/chat';
import { db } from '~/services/database';

export default create.module({
    name: 'channels',
    priority: 5,
    register: async () => {
        const allChannels = await db.query.channels.findMany({
            columns: { twitchId: true },
        });

        const channelIds = allChannels.map(({ twitchId }) => twitchId);

        const channels = await helix.users
            .getUsersByIds(channelIds)
            .then((response) => response.map(({ name }) => name));

        if (channels.length !== channelIds.length) {
            logger.channels(
                `missing ${channelIds.length - channels.length} channels after api call`,
            );
        }

        logger.channels(`joining ${channels.length} channels`);
        await chat.joinAll(channels);
    },
});
