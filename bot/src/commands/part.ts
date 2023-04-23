import { channels as channelsTable, eq } from '@synopsis/db';

import { type BotCommand } from '~/types/client';
import { env } from '~/utils/env';
import { channelSchema } from '~/utils/zod';

export const command: BotCommand = {
    name: 'part',
    description: 'part the bot from a channel',
    run: async ({ msg, chat, db, api }) => {
        if (msg.userInfo.userName !== env.TWITCH_BOT_OWNER_USERNAME) return;

        const params = msg.text.split(' ');
        const channel = params.at(2)?.toLowerCase();
        if (!channel) {
            return await chat.say(
                msg.channel,
                `@${msg.userInfo.displayName}, you didn't specify a channel.`,
                { replyTo: msg }
            );
        }

        const channelSchemaResult = channelSchema.safeParse(channel);
        if (!channelSchemaResult.success) {
            return await chat.say(
                msg.channel,
                `@${msg.userInfo.displayName}, invalid channel name.`,
                { replyTo: msg }
            );
        }

        const isDefaultChannel = [env.TWITCH_BOT_OWNER_USERNAME, env.TWITCH_BOT_USERNAME].includes(
            channel
        );
        if (isDefaultChannel) {
            return await chat.say(
                msg.channel,
                `@${msg.userInfo.displayName}, you can't part a default channel.`,
                { replyTo: msg }
            );
        }

        const apiChannel = await api.users.getUserByName(channel);
        if (!apiChannel) {
            return await chat.say(
                msg.channel,
                `@${msg.userInfo.displayName}, channel ${channel} not found.`,
                { replyTo: msg }
            );
        }

        const dbChannel = await db
            .select()
            .from(channelsTable)
            .where(eq(channelsTable.twitchId, apiChannel.id));

        if (dbChannel.length === 0) {
            return await chat.say(
                msg.channel,
                `@${msg.userInfo.displayName}, channel ${channel} does not exist in the database.`,
                { replyTo: msg }
            );
        }

        await db.delete(channelsTable).where(eq(channelsTable.twitchId, apiChannel.id));
        await chat.part(channel);
        return await chat.say(
            msg.channel,
            `@${msg.userInfo.displayName}, channel ${channel} has been parted!`,
            { replyTo: msg }
        );
    },
};
