import { channels, eq } from '@synopsis/db';
import { z } from 'zod';

import { create } from '~/helpers/creators';
import { schemas } from '~/helpers/schemas';
import { chat } from '~/services/chat';
import { db } from '~/services/database';

export default create.command({
    name: 'part',
    description: 'Make the bot part a channel',
    permissions: { global: 'owner' },
    usage: [['part channel:<channel>', 'Parts the specified channel']],

    arguments: z.tuple([schemas.twitch.idOrLogin()]),

    run: async ({ args: [channel] }) => {
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
