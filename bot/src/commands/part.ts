import { channels, eq } from '@synopsis/db';

import { createCommand } from '~/helpers/command/define';
import { schemas } from '~/helpers/schemas';
import { chat } from '~/services/chat';
import { db } from '~/services/database';

export default createCommand({
    name: 'part',
    description: 'Make the bot part a channel',
    permissions: { global: 'owner' },
    usage: [['part channel:<channel>', 'Parts the specified channel']],
    options: {
        channel: {
            aliases: ['c'],
            schema: schemas.twitch.idOrLogin(),
        },
    },
    run: async ({ options: { channel } }) => {
        const existing = await db.query.channels.findFirst({
            where: (channels, { eq }) =>
                'id' in channel
                    ? eq(channels.twitchId, channel.id)
                    : eq(channels.twitchLogin, channel.login),
        });

        if (!existing) {
            if ('login' in channel) {
                await chat.part(channel.login);
                return { reply: 'Channel not found in the database, attempted to part anyways.' };
            }
            return { reply: 'Channel not found in the database.' };
        }

        await db
            .delete(channels)
            .where(
                'id' in channel
                    ? eq(channels.twitchId, channel.id)
                    : eq(channels.twitchLogin, channel.login),
            );

        await chat.part(existing.twitchLogin);
        return { reply: `Parted channel ${existing.twitchLogin}.` };
    },
});
