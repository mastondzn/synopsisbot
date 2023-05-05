import { type ChannelMode, channels as channelsTable, eq } from '@synopsis/db';

import { collectMessage } from '~/helpers/message-collector';
import { channelSchema } from '~/helpers/zod';
import { type BotCommand } from '~/types/client';

export const command: BotCommand = {
    name: 'owner',
    description: 'Lets the owner do certain things. Like joining and parting channels.',
    permission: { global: 'owner' },
    usage: [
        'part <channel>',
        'part <channel> confirm',
        '',
        'join <channel>',
        'join <channel> offlineonly',
        'join <channel> readonly',
        'join <channel> all',
        '',
        'global ban <user>',
        'global unban <user>',
        '',
        'local ban <channel|"_"> <user>',
        'local unban <channel|"_"> <user>',
        'local ambassador <channel|"_"> <user>',
        'local unambassador <channel|"_"> <user>',
    ].join('\n'),

    run: async ({ msg, chat, params, db, reply, utils: { idLoginPairs, permissions } }) => {
        const command = params.list.at(0)?.toLowerCase();

        if (
            command !== 'part' &&
            command !== 'join' &&
            command !== 'global' &&
            command !== 'local'
        ) {
            return await reply('Invalid subcommand.');
        }

        if (command === 'join' || command === 'part') {
            const subcommand = command;
            // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
            if (!subcommand || (subcommand !== 'join' && subcommand !== 'part')) {
                return await reply('Invalid subcommand.');
            }

            const channel = params.list.at(1)?.toLowerCase().replace(/^#/, '');
            if (!channel) {
                return await reply('You did not specify a channel.');
            }

            const channelSchemaResult = channelSchema.safeParse(channel);
            if (!channelSchemaResult.success) {
                return await reply('Invalid channel name.');
            }

            const channelId = await idLoginPairs.getId(channel);
            if (!channelId) return await reply(`Channel ${channel} not found.`);

            if (subcommand === 'join') {
                let isOfflineOnlyMode = params.list.at(2)?.toLowerCase() === 'offlineonly';
                const isReadOnlyMode = params.list.at(2)?.toLowerCase() === 'readonly';
                const isAllMode = params.list.at(2)?.toLowerCase() === 'all';

                if (params.list.at(2) && !isOfflineOnlyMode && !isReadOnlyMode && !isAllMode) {
                    return await reply(
                        'Invalid channel mode. Must be one of: "offlineonly", "readonly" or "all". Defaults to offlineonly.'
                    );
                }

                if (!isAllMode && !isReadOnlyMode && !isOfflineOnlyMode) isOfflineOnlyMode = true;

                const mode: ChannelMode = isOfflineOnlyMode
                    ? 'offlineonly'
                    : isReadOnlyMode
                    ? 'readonly'
                    : 'all';

                const [dbChannel] = await db
                    .select()
                    .from(channelsTable)
                    .where(eq(channelsTable.twitchId, channelId))
                    .limit(1);

                if (dbChannel && dbChannel.mode === mode) {
                    await chat.join(channel);
                    return await reply(
                        `Channel ${channel} is already present in the database with same mode. Attempted to join again.`
                    );
                }

                if (dbChannel && dbChannel.mode !== mode) {
                    await db
                        .update(channelsTable)
                        .set({ mode })
                        .where(eq(channelsTable.twitchId, channelId));
                    await chat.join(channel);

                    return await reply(
                        `Channel ${channel} is already present in the database. Updated mode from ${dbChannel.mode} to ${mode} and attempted to join again.`
                    );
                }

                if (!dbChannel) {
                    await db.insert(channelsTable).values({
                        twitchId: channelId,
                        twitchLogin: channel,
                        mode,
                    });
                    await chat.join(channel);

                    return await reply(`Joined channel ${channel} in ${mode} mode.`);
                }
            }

            if (subcommand === 'part') {
                const isConfirmed = params.list.at(3)?.toLowerCase() === 'confirm';
                if (params.list.at(3) && !isConfirmed) {
                    return await reply(
                        'Invalid 3rd argument. Must be "confirm" or nothing. Defaults to prompting for confirmation.'
                    );
                }

                const [dbChannel] = await db
                    .select()
                    .from(channelsTable)
                    .where(eq(channelsTable.twitchId, channelId))
                    .limit(1);

                if (!dbChannel) {
                    await chat.part(channel);
                    return await reply(
                        `Channel ${channel} is not present in the database. Attempted to leave from chat anyway.`
                    );
                }

                if (!isConfirmed) {
                    await reply(
                        [
                            // TODO: change this to the truth
                            `Are you sure you want the bot to leave channel ${channel}?`,
                            `This will delete the channel data, including the ambassador list and probably other channel settings.`,
                            `You can instead change the channel mode to readonly using "sb owner bot join ${channel} readonly"`,
                            `Type "confirm" in the next 15s to confirm.`,
                        ].join(' ')
                    );

                    const message = await collectMessage({
                        filter: (incoming) =>
                            incoming.senderUserID === msg.senderUserID &&
                            incoming.messageText.trim() === 'confirm',
                        timeout: 15,
                        chat,
                    }).catch(() => 'timeout' as const);

                    if (message === 'timeout') return;
                }

                await chat.part(channel);
                await db.delete(channelsTable).where(eq(channelsTable.twitchId, channelId));
                return await reply(`Left channel ${channel} and deleted settings from database.`);
            }
            return;
        }

        if (command === 'global') {
            const subcommand = params.list.at(1)?.toLowerCase();
            if (!subcommand || (subcommand !== 'ban' && subcommand !== 'unban')) {
                return await reply('Invalid subcommand.');
            }

            const user = params.list.at(2)?.toLowerCase().replace('@', '');

            if (!user) {
                return await reply('You need to specify a user.');
            }

            const userSchemaResult = channelSchema.safeParse(user);
            if (!userSchemaResult.success) {
                return await reply('Invalid channel or user name.');
            }

            const userId = await idLoginPairs.getId(user);
            if (!userId) return await reply(`User ${user} not found.`);

            const currentPermission = await permissions.getGlobalPermission(userId);

            if (subcommand === 'ban') {
                if (currentPermission === 'banned') {
                    return await reply(`User ${user} is already banned globally.`);
                }
                await permissions.setGlobalPermission('banned', {
                    user: { id: userId, login: user },
                });
                await reply(`Banned user ${user} globally from using the bot.`);
            }

            if (subcommand === 'unban') {
                if (currentPermission === 'normal') {
                    return await reply(`User ${user} is not currently banned globally.`);
                }
                await permissions.setGlobalPermission('normal', {
                    user: { id: userId, login: user },
                });
                await reply(`Unbanned user ${user} globally from using the bot.`);
            }

            return;
        }

        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        if (command === 'local') {
            const subcommand = params.list.at(1)?.toLowerCase();
            if (
                !subcommand ||
                (subcommand !== 'ban' &&
                    subcommand !== 'unban' &&
                    subcommand !== 'ambassador' &&
                    subcommand !== 'unambassador')
            ) {
                return await reply('Invalid subcommand.');
            }

            const channel = params.list
                .at(2)
                ?.toLowerCase()
                .replace(/^#/, '')
                .replace(/^_$/, msg.channelName);
            const user = params.list.at(3)?.toLowerCase().replace('@', '');
            const userSchemaResult = channelSchema.safeParse(user);
            const channelSchemaResult = channelSchema.safeParse(channel);

            if (!channel || !user || !userSchemaResult.success || !channelSchemaResult.success) {
                return await reply('You need to specify both a valid channel and a valid user.');
            }

            const [channelId, userId] = await Promise.all([
                idLoginPairs.getId(channel),
                idLoginPairs.getId(user),
            ]);
            if (!channelId) return await reply(`Channel ${channel} not found.`);
            if (!userId) return await reply(`User ${user} not found.`);

            const context = {
                channel: {
                    id: channelId,
                    login: channel,
                },
                user: {
                    id: userId,
                    login: user,
                },
            };

            const currentPermission =
                (await permissions.getDbLocalPermission(channelId, userId)) ?? 'normal';

            if (subcommand === 'ban') {
                if (currentPermission === 'banned') {
                    return await reply(`User ${user} is already banned in channel ${channel}.`);
                }
                await permissions.setLocalPermission('banned', context);
                return await reply(`Banned user ${user} from using the bot in channel ${channel}.`);
            }

            if (subcommand === 'unban') {
                if (currentPermission === 'normal') {
                    return await reply(
                        `User ${user} is not currently banned in channel ${channel}.`
                    );
                }
                await permissions.setLocalPermission('normal', context);
                return await reply(
                    `Unbanned user ${user} from using the bot in channel ${channel}.`
                );
            }

            if (subcommand === 'ambassador') {
                if (currentPermission === 'ambassador') {
                    return await reply(
                        `User ${user} is already an ambassador in channel ${channel}.`
                    );
                }
                await permissions.setLocalPermission('ambassador', context);
                return await reply(`Set user ${user} as ambassador in channel ${channel}.`);
            }

            // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
            if (subcommand === 'unambassador') {
                if (currentPermission === 'normal') {
                    return await reply(
                        `User ${user} is not currently an ambassador in channel ${channel}.`
                    );
                }
                await permissions.setLocalPermission('normal', context);
                return await reply(`Unset user ${user} as ambassador in channel ${channel}.`);
            }

            return;
        }
    },
};
