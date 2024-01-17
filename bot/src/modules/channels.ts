import { defineModule } from '~/helpers/module/define';
import { api } from '~/services/api';
import { chat } from '~/services/chat';
import { db } from '~/services/database';

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
                '[modules:channels]',
                `missing ${channelIds.length - channels.length} channels after api call`,
            );
        }

        console.log('[modules:channels]', `joining ${channels.length} channels`);
        await chat.joinAll(channels);
    },
});
