import { channels as channelsTable, eq } from '@synopsis/db';
import { env } from '@synopsis/env/node';

import { type BotCommand } from '~/types/client';
import { channelSchema } from '~/utils/zod';

export const command: BotCommand = {
    name: 'part',
    description: 'part the bot from a channel',
    permission: {
        global: 'owner',
    },
    run: async ({ msg, chat, db, api, reply, params }) => {
        if (msg.senderUsername !== env.TWITCH_BOT_OWNER_USERNAME) return;

        const channel = params.list.at(0)?.toLowerCase();
        if (!channel) {
            return await reply(`You didn't specify a channel.`);
        }

        const channelSchemaResult = channelSchema.safeParse(channel);
        if (!channelSchemaResult.success) {
            return await reply(`Invalid channel name.`);
        }

        const isDefaultChannel = //
            [env.TWITCH_BOT_OWNER_USERNAME, env.TWITCH_BOT_USERNAME].includes(channel);

        if (isDefaultChannel) return await reply("You can't part a default channel.");

        const apiChannel = await api.users.getUserByName(channel);
        if (!apiChannel) return await reply(`Channel ${channel} not found.`);

        const dbChannel = await db
            .select()
            .from(channelsTable)
            .where(eq(channelsTable.twitchId, apiChannel.id));

        if (dbChannel.length === 0) {
            return await reply(`Channel ${channel} does not exist in the database.`);
        }

        await db.delete(channelsTable).where(eq(channelsTable.twitchId, apiChannel.id));
        await chat.part(channel);
        return await reply(`Channel ${channel} has been parted!`);
    },
};
