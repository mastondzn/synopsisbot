import { channels as channelsTable, eq } from '@synopsis/db';
import { env } from '@synopsis/env/node';

import { channelModeSchema, channelSchema } from '~/helpers/zod';
import { type BotCommand } from '~/types/client';

export const command: BotCommand = {
    name: 'join',
    description: 'Join the bot to a channel.',
    permission: { global: 'owner' },

    run: async ({ chat, db, reply, params, utils: { idLoginPairs } }) => {
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

        const channelId = await idLoginPairs.getId(channel);
        if (!channelId) {
            return await reply(`Channel ${channel} not found.`);
        }

        const dbChannel = await db
            .select()
            .from(channelsTable)
            .where(eq(channelsTable.twitchId, channelId));

        if (dbChannel.length > 0) {
            return await reply(`Channel ${channel} already exists in database.`);
        }

        await db.insert(channelsTable).values({
            twitchId: channelId,
            twitchLogin: channel,
            mode: modeSchemaResult.data,
        });
        await chat.join(channel);
        return await reply(`Joined channel ${channel} in ${modeSchemaResult.data} mode`);
    },
};
