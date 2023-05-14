import { type ChannelMode, channels as channelsTable, eq } from '@synopsis/db';

import { parseUserParameter, runDeepCommand } from '~/helpers/command';
import { collectMessage } from '~/helpers/message-collector';
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

    run: (ctx) => {
        const {
            reply,
            params,
            db,
            chat,
            msg,
            utils: { permissions },
        } = ctx;

        return runDeepCommand({
            ctx,
            commands: {
                join: async () => {
                    const channelParameter = await parseUserParameter(ctx, 1, true);

                    if (!channelParameter.ok) return await reply(channelParameter.reason);

                    const { login: channel, id: channelId } = channelParameter;

                    let isOfflineOnlyMode = params.list.at(2)?.toLowerCase() === 'offlineonly';
                    const isReadOnlyMode = params.list.at(2)?.toLowerCase() === 'readonly';
                    const isAllMode = params.list.at(2)?.toLowerCase() === 'all';

                    if (params.list.at(2) && !isOfflineOnlyMode && !isReadOnlyMode && !isAllMode) {
                        return await reply(
                            'Invalid channel mode. Must be one of: "offlineonly", "readonly" or "all". Defaults to offlineonly.'
                        );
                    }

                    if (!isAllMode && !isReadOnlyMode && !isOfflineOnlyMode)
                        isOfflineOnlyMode = true;

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
                },

                //

                part: async () => {
                    const channelExtractionResult = await parseUserParameter(ctx, 1, true);

                    if (!channelExtractionResult.ok)
                        return await reply(channelExtractionResult.reason);

                    const { login: channel, id: channelId } = channelExtractionResult;

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
                                'This will delete the channel data, including the ambassador list and probably other channel settings.',
                                `You can instead change the channel mode to readonly using "sb owner bot join ${channel} readonly"`,
                                'Type "confirm" in the next 15s to confirm.',
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
                    return await reply(
                        `Left channel ${channel} and deleted settings from database.`
                    );
                },

                //

                global: {
                    ban: async () => {
                        const user = await parseUserParameter(ctx, 2, true);
                        if (!user.ok) return await reply(user.reason);

                        const currentPermission = await permissions.getGlobalPermission(user.id);

                        if (currentPermission === 'banned') {
                            return await reply(`${user.login} is already banned globally.`);
                        }

                        await permissions.setGlobalPermission('banned', { user });
                        return await reply(
                            `Banned user ${user.login} globally from using the bot.`
                        );
                    },

                    unban: async () => {
                        const user = await parseUserParameter(ctx, 2, true);
                        if (!user.ok) return await reply(user.reason);

                        const currentPermission = await permissions.getGlobalPermission(user.id);

                        if (currentPermission === 'normal') {
                            return await reply(`${user.login} is not currently banned globally.`);
                        }

                        await permissions.setGlobalPermission('normal', { user });
                        return await reply(
                            `Unbanned user ${user.login} globally from using the bot.`
                        );
                    },
                },

                //

                local: {
                    ban: async () => {
                        const [channel, user] = await Promise.all([
                            parseUserParameter(ctx, 2, true),
                            parseUserParameter(ctx, 3, true),
                        ]);

                        if (!channel.ok) {
                            return await reply(channel.reason);
                        }
                        if (!user.ok) {
                            return await reply(user.reason);
                        }

                        const context = { channel, user };

                        const currentPermission =
                            (await permissions.getDbLocalPermission(channel.id, user.id)) ??
                            'normal';

                        if (currentPermission === 'banned') {
                            return await reply(
                                `User ${user.login} is already banned in channel ${channel.login}.`
                            );
                        }
                        await permissions.setLocalPermission('banned', context);
                        return await reply(
                            `Banned user ${user.login} from using the bot in channel ${channel.login}.`
                        );
                    },
                    unban: async () => {
                        const [channel, user] = await Promise.all([
                            parseUserParameter(ctx, 2, true),
                            parseUserParameter(ctx, 3, true),
                        ]);

                        if (!channel.ok) {
                            return await reply(channel.reason);
                        }
                        if (!user.ok) {
                            return await reply(user.reason);
                        }

                        const context = { channel, user };

                        const currentPermission =
                            (await permissions.getDbLocalPermission(channel.id, user.id)) ??
                            'normal';

                        if (currentPermission === 'normal') {
                            return await reply(
                                `User ${user.login} is not currently banned in channel ${channel.login}.`
                            );
                        }
                        await permissions.setLocalPermission('normal', context);
                        return await reply(
                            `Unbanned user ${user.login} from using the bot in channel ${channel.login}.`
                        );
                    },

                    ambassador: async () => {
                        const [channel, user] = await Promise.all([
                            parseUserParameter(ctx, 2, true),
                            parseUserParameter(ctx, 3, true),
                        ]);

                        if (!channel.ok) {
                            return await reply(channel.reason);
                        }
                        if (!user.ok) {
                            return await reply(user.reason);
                        }

                        const context = { channel, user };

                        const currentPermission =
                            (await permissions.getDbLocalPermission(channel.id, user.id)) ??
                            'normal';

                        if (currentPermission === 'ambassador') {
                            return await reply(
                                `User ${user.login} is already an ambassador in channel ${channel.login}.`
                            );
                        }
                        await permissions.setLocalPermission('ambassador', context);
                        return await reply(
                            `Set user ${user.login} as ambassador in channel ${channel.login}.`
                        );
                    },
                    unambassador: async () => {
                        const [channel, user] = await Promise.all([
                            parseUserParameter(ctx, 2, true),
                            parseUserParameter(ctx, 3, true),
                        ]);

                        if (!channel.ok) {
                            return await reply(channel.reason);
                        }
                        if (!user.ok) {
                            return await reply(user.reason);
                        }

                        const context = { channel, user };

                        const currentPermission =
                            (await permissions.getDbLocalPermission(channel.id, user.id)) ??
                            'normal';

                        if (currentPermission === 'normal') {
                            return await reply(
                                `User ${user.login} is not currently an ambassador in channel ${channel.login}.`
                            );
                        }
                        await permissions.setLocalPermission('normal', context);
                        return await reply(
                            `Unset user ${user.login} as ambassador in channel ${channel.login}.`
                        );
                    },
                },
            },
            onNotFound: async () => await reply('Invalid subcommand.'),
        });
    },
};
