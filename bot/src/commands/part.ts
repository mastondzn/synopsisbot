import { channels as channelsTable, eq } from '@synopsis/db';
import { env } from '@synopsis/env/node';

import { channelSchema } from '~/helpers/zod';
import { type BotCommand } from '~/types/client';

export const command: BotCommand = {
    name: 'part',
    description: 'Part the bot from a channel.',
    permission: { global: 'owner' },

    run: async ({ msg, chat, db, reply, params, utils: { idLoginPairs } }) => {
        if (msg.senderUsername !== env.TWITCH_BOT_OWNER_USERNAME) return;

        const channel = params.list.at(0)?.toLowerCase();
        if (!channel) return await reply(`You didn't specify a channel.`);

        const channelSchemaResult = channelSchema.safeParse(channel);
        if (!channelSchemaResult.success) return await reply(`Invalid channel name.`);

        const isDefaultChannel = //
            [env.TWITCH_BOT_OWNER_USERNAME, env.TWITCH_BOT_USERNAME].includes(channel);

        if (isDefaultChannel) return await reply("You can't part a default channel.");

        const channelId = await idLoginPairs.getId(channel);
        if (!channelId) return await reply(`Channel ${channel} not found.`);

        const dbChannel = await db
            .select()
            .from(channelsTable)
            .where(eq(channelsTable.twitchId, channelId));

        if (dbChannel.length === 0) {
            return await reply(`Channel ${channel} does not exist in the database.`);
        }

        await db.delete(channelsTable).where(eq(channelsTable.twitchId, channelId));
        await chat.part(channel);
        return await reply(`Channel ${channel} has been parted!`);
    },
};
