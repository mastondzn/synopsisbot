import { channels as channelsTable, eq } from '@synopsis/db';
import { env } from '@synopsis/env/node';

import { type BotCommand } from '~/types/client';
import { channelModeSchema, channelSchema } from '~/utils/zod';

export const command: BotCommand = {
    name: 'join',
    description: 'join the bot to a channel',
    run: async ({ msg, chat, db, api, reply, params }) => {
        if (msg.senderUsername !== env.TWITCH_BOT_OWNER_USERNAME) return;

        const channel = params.list.at(0)?.toLowerCase();
        if (!channel) {
            return await reply("You didn't specify a channel.");
        }

        const mode = params.list.at(1);

        const channelSchemaResult = channelSchema.safeParse(channel);
        if (!channelSchemaResult.success) {
            return await reply('Invalid channel name.');
        }

        const modeSchemaResult = channelModeSchema.safeParse(mode);
        if (!modeSchemaResult.success) {
            return await reply(`Invalid mode. (${mode ?? '?'})`);
        }

        const isDefaultChannel = //
            [env.TWITCH_BOT_OWNER_USERNAME, env.TWITCH_BOT_USERNAME].includes(channel);

        if (isDefaultChannel) {
            return await reply(`That channel is a default channel.`);
        }

        const apiChannel = await api.users.getUserByName(channel);
        if (!apiChannel) {
            return await reply(`Channel ${channel} not found.`);
        }

        const dbChannel = await db
            .select()
            .from(channelsTable)
            .where(eq(channelsTable.twitchId, apiChannel.id));

        if (dbChannel.length > 0) {
            return await reply(`Channel ${channel} already exists in database.`);
        }

        await db.insert(channelsTable).values({
            twitchId: apiChannel.id,
            twitchLogin: apiChannel.name,
            mode: modeSchemaResult.data,
        });
        await chat.join(apiChannel.name);
        return await reply(`Joined channel ${channel}! (mode: ${modeSchemaResult.data})`);
    },
};
