import { prefixes } from '~/helpers/log-prefixes';
import { defineModule } from '~/helpers/module/define';
import { api, chat, db } from '~/services';

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
            .then((response) => response.map(({ name }) => name));

        if (channels.length !== channelIds.length) {
            console.warn(
                prefixes.channels,
                `missing ${channelIds.length - channels.length} channels after api call`,
            );
        }

        console.log(prefixes.channels, `joining ${channels.length} channels`);
        await chat.joinAll(channels);
    },
});
