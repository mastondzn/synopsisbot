import { prefixes } from '~/helpers/log-prefixes';
import { createModule } from '~/helpers/module/define';
import { chat, db, helix } from '~/services';

export default createModule({
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
            console.warn(
                prefixes.channels,
                `missing ${channelIds.length - channels.length} channels after api call`,
            );
        }

        console.log(prefixes.channels, `joining ${channels.length} channels`);
        await chat.joinAll(channels);
    },
});
