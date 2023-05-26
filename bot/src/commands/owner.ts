import { channels as channelsTable, eq } from '@synopsis/db';

import { parseUserParameter } from '~/helpers/command';
import { type BotCommand, type BotSubcommand } from '~/types/client';

const subcommands: BotSubcommand[] = [
    {
        path: ['join'],
        run: async (ctx) => {
            const { params, db, chat } = ctx;

            const channel = await parseUserParameter(ctx, 1, true);
            if (!channel.ok) return { reply: channel.reason };

            const desiredMode = params.list.at(2)?.toLowerCase();
            const mode =
                desiredMode === 'offlineonly'
                    ? 'offlineonly'
                    : desiredMode === 'readonly'
                    ? 'readonly'
                    : desiredMode === 'all'
                    ? 'all'
                    : 'offlineonly';

            if (desiredMode && mode !== desiredMode) {
                return {
                    reply: 'Invalid channel mode. Must be one of: "offlineonly", "readonly" or "all". Defaults to offlineonly.',
                };
            }

            const channelFromDb = await db.query.channels.findFirst({
                where: (channels, { eq }) => eq(channels.twitchLogin, channel.login),
            });

            if (channelFromDb && channelFromDb.mode === mode) {
                await chat.join(channel.login);
                return {
                    reply: `Channel ${channel.login} is already present in the database with same mode. Attempted to join again.`,
                };
            }

            if (channelFromDb && channelFromDb.mode !== mode) {
                await db
                    .update(channelsTable)
                    .set({ mode })
                    .where(eq(channelsTable.twitchId, channel.id));
                await chat.join(channel.login);
                return {
                    reply: `Channel ${channel.login} is already present in the database. Updated mode from ${channelFromDb.mode} to ${mode} and attempted to join again.`,
                };
            }

            if (!channelFromDb) {
                await db.insert(channelsTable).values({
                    twitchId: channel.id,
                    twitchLogin: channel.login,
                    mode,
                });
                await chat.join(channel.login);
                return { reply: `Joined channel ${channel.login} in ${mode} mode.` };
            }
            return;
        },
    },
    {
        path: ['part'],
        run: async (ctx) => {
            const { chat, db } = ctx;

            const channel = await parseUserParameter(ctx, 1, true);
            if (!channel.ok) return { reply: channel.reason };

            const channelFromDb = await db.query.channels.findFirst({
                where: (channels, { eq }) => eq(channels.twitchLogin, channel.login),
            });

            if (!channelFromDb) {
                await chat.part(channel.login);
                return {
                    reply: `Channel ${channel.login} is not present in the database. Attempted to leave from chat anyway.`,
                };
            }

            await chat.part(channel.login);
            await db.delete(channelsTable).where(eq(channelsTable.twitchId, channel.id));
            return { reply: `Left channel ${channel.login} and deleted settings from database.` };
        },
    },
    {
        path: ['global', 'ban'],
        run: async (ctx) => {
            const {
                utils: { permissions },
            } = ctx;

            const user = await parseUserParameter(ctx, 2, true);
            if (!user.ok) return { reply: user.reason };

            const currentPermission = await permissions.getGlobalPermission(user.id);
            if (currentPermission === 'banned') {
                return { reply: `${user.login} is already banned globally.` };
            }

            await permissions.setGlobalPermission('banned', { user });
            return { reply: `Banned user ${user.login} globally from using the bot.` };
        },
    },
    {
        path: ['global', 'unban'],
        run: async (ctx) => {
            const {
                utils: { permissions },
            } = ctx;

            const user = await parseUserParameter(ctx, 2, true);
            if (!user.ok) return { reply: user.reason };

            const currentPermission = await permissions.getGlobalPermission(user.id);
            if (currentPermission === 'normal') {
                return { reply: `${user.login} is not currently banned globally.` };
            }

            await permissions.setGlobalPermission('normal', { user });
            return { reply: `Unbanned user ${user.login} globally from using the bot.` };
        },
    },
    {
        path: ['local', 'ban'],
        run: async (ctx) => {
            const {
                utils: { permissions },
            } = ctx;

            const [channel, user] = await Promise.all([
                parseUserParameter(ctx, 2, true),
                parseUserParameter(ctx, 3, true),
            ]);

            if (!channel.ok) {
                return { reply: channel.reason };
            }
            if (!user.ok) {
                return { reply: user.reason };
            }

            const context = { channel, user };

            const currentPermission =
                (await permissions.getDbLocalPermission(channel.id, user.id)) ?? 'normal';

            if (currentPermission === 'banned') {
                return {
                    reply: `User ${user.login} is already banned in channel ${channel.login}.`,
                };
            }
            await permissions.setLocalPermission('banned', context);
            return {
                reply: `Banned user ${user.login} from using the bot in channel ${channel.login}.`,
            };
        },
    },
    {
        path: ['local', 'unban'],
        run: async (ctx) => {
            const {
                utils: { permissions },
            } = ctx;

            const [channel, user] = await Promise.all([
                parseUserParameter(ctx, 2, true),
                parseUserParameter(ctx, 3, true),
            ]);

            if (!channel.ok) {
                return { reply: channel.reason };
            }
            if (!user.ok) {
                return { reply: user.reason };
            }

            const currentPermission =
                (await permissions.getDbLocalPermission(channel.id, user.id)) ?? 'normal';

            if (currentPermission === 'normal') {
                return {
                    reply: `User ${user.login} is not currently banned in channel ${channel.login}.`,
                };
            }
            await permissions.setLocalPermission('normal', { channel, user });
            return {
                reply: `Unbanned user ${user.login} from using the bot in channel ${channel.login}.`,
            };
        },
    },
    {
        path: ['local', 'ambassador'],
        run: async (ctx) => {
            const {
                utils: { permissions },
            } = ctx;

            const [channel, user] = await Promise.all([
                parseUserParameter(ctx, 2, true),
                parseUserParameter(ctx, 3, true),
            ]);

            if (!channel.ok) {
                return { reply: channel.reason };
            }
            if (!user.ok) {
                return { reply: user.reason };
            }

            const currentPermission =
                (await permissions.getDbLocalPermission(channel.id, user.id)) ?? 'normal';

            if (currentPermission === 'ambassador') {
                return {
                    reply: `User ${user.login} is already an ambassador in channel ${channel.login}.`,
                };
            }
            await permissions.setLocalPermission('ambassador', { channel, user });
            return { reply: `Set user ${user.login} as ambassador in channel ${channel.login}.` };
        },
    },
    {
        path: ['local', 'unambassador'],
        run: async (ctx) => {
            const {
                utils: { permissions },
            } = ctx;

            const [channel, user] = await Promise.all([
                parseUserParameter(ctx, 2, true),
                parseUserParameter(ctx, 3, true),
            ]);

            if (!channel.ok) {
                return { reply: channel.reason };
            }
            if (!user.ok) {
                return { reply: user.reason };
            }

            const context = { channel, user };

            const currentPermission =
                (await permissions.getDbLocalPermission(channel.id, user.id)) ?? 'normal';

            if (currentPermission === 'normal') {
                return {
                    reply: `User ${user.login} is not currently an ambassador in channel ${channel.login}.`,
                };
            }
            await permissions.setLocalPermission('normal', context);
            return { reply: `Unset user ${user.login} as ambassador in channel ${channel.login}.` };
        },
    },
];

export const command: BotCommand = {
    name: 'owner',
    description: 'Lets the owner do certain things. Like joining and parting channels.',
    permission: { global: 'owner' },
    usage: [
        'owner part <channel>',
        'Parts the bot from the specified channel.',
        '',
        'owner join <channel>',
        'owner join <channel> offlineonly',
        'owner join <channel> readonly',
        'owner join <channel> all',
        'Joins the bot to the specified channel. Defaults to offlineonly mode.',
        '',
        'owner global ban <user>',
        'owner global unban <user>',
        'Globally bans or unbans a user from using the bot.',
        '',
        'owner local ban <channel|"_"> <user>',
        'owner local unban <channel|"_"> <user>',
        'owner local ambassador <channel|"_"> <user>',
        'owner local unambassador <channel|"_"> <user>',
        'Locally bans, unbans, promotes or demotes a user in the specified channel. "_" can be used to target current channel.',
    ].join('\n'),

    run: () => ({ reply: "Please specify a subcommand such as 'sb owner join ...'" }),
};
