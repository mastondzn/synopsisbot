import { channels, eq } from '@synopsis/db';

import { parseUserParameter } from '~/helpers/command';
import type { BotSubcommand } from '~/types/client';

export const subcommands: BotSubcommand[] = [
    {
        path: ['join'],
        run: async (context) => {
            const { params, db, chat } = context;

            const channel = await parseUserParameter(context, 1, true);
            if (!channel.ok) { return { reply: channel.reason }; }

            const desiredMode = params.list.at(2)?.toLowerCase();
            const mode
                = desiredMode === 'offlineonly'
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

            const channelFromDatabase = await db.query.channels.findFirst({
                where: (channels, { eq }) => eq(channels.twitchLogin, channel.login),
            });

            if (channelFromDatabase && channelFromDatabase.mode === mode) {
                await chat.join(channel.login);
                return {
                    reply: `Channel ${channel.login} is already present in the database with same mode. Attempted to join again.`,
                };
            }

            if (channelFromDatabase && channelFromDatabase.mode !== mode) {
                await db.update(channels).set({ mode }).where(eq(channels.twitchId, channel.id));
                await chat.join(channel.login);
                return {
                    reply: `Channel ${channel.login} is already present in the database. Updated mode from ${channelFromDatabase.mode} to ${mode} and attempted to join again.`,
                };
            }

            if (!channelFromDatabase) {
                await db.insert(channels).values({
                    twitchId: channel.id,
                    twitchLogin: channel.login,
                    mode,
                });
                await chat.join(channel.login);
                return { reply: `Joined channel ${channel.login} in ${mode} mode.` };
            }
        },
    },
    {
        path: ['part'],
        run: async (context) => {
            const { chat, db } = context;

            const channel = await parseUserParameter(context, 1, true);
            if (!channel.ok) { return { reply: channel.reason }; }

            const channelFromDatabase = await db.query.channels.findFirst({
                where: (channels, { eq }) => eq(channels.twitchLogin, channel.login),
            });

            if (!channelFromDatabase) {
                await chat.part(channel.login);
                return {
                    reply: `Channel ${channel.login} is not present in the database. Attempted to leave from chat anyway.`,
                };
            }

            await chat.part(channel.login);
            await db.delete(channels).where(eq(channels.twitchId, channel.id));
            return { reply: `Left channel ${channel.login} and deleted settings from database.` };
        },
    },
    {
        path: ['global', 'ban'],
        run: async (context) => {
            const {
                utils: { permissions },
            } = context;

            const user = await parseUserParameter(context, 2, true);
            if (!user.ok) { return { reply: user.reason }; }

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
        run: async (context) => {
            const {
                utils: { permissions },
            } = context;

            const user = await parseUserParameter(context, 2, true);
            if (!user.ok) { return { reply: user.reason }; }

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
        run: async (context_) => {
            const {
                utils: { permissions },
            } = context_;

            const [channel, user] = await Promise.all([
                parseUserParameter(context_, 2, true),
                parseUserParameter(context_, 3, true),
            ]);

            if (!channel.ok) {
                return { reply: channel.reason };
            }
            if (!user.ok) {
                return { reply: user.reason };
            }

            const context = { channel, user };

            const currentPermission
                = (await permissions.getDbLocalPermission(channel.id, user.id)) ?? 'normal';

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
        run: async (context) => {
            const {
                utils: { permissions },
            } = context;

            const [channel, user] = await Promise.all([
                parseUserParameter(context, 2, true),
                parseUserParameter(context, 3, true),
            ]);

            if (!channel.ok) {
                return { reply: channel.reason };
            }
            if (!user.ok) {
                return { reply: user.reason };
            }

            const currentPermission
                = (await permissions.getDbLocalPermission(channel.id, user.id)) ?? 'normal';

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
        run: async (context) => {
            const {
                utils: { permissions },
            } = context;

            const [channel, user] = await Promise.all([
                parseUserParameter(context, 2, true),
                parseUserParameter(context, 3, true),
            ]);

            if (!channel.ok) {
                return { reply: channel.reason };
            }
            if (!user.ok) {
                return { reply: user.reason };
            }

            const currentPermission
                = (await permissions.getDbLocalPermission(channel.id, user.id)) ?? 'normal';

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
        run: async (context_) => {
            const {
                utils: { permissions },
            } = context_;

            const [channel, user] = await Promise.all([
                parseUserParameter(context_, 2, true),
                parseUserParameter(context_, 3, true),
            ]);

            if (!channel.ok) {
                return { reply: channel.reason };
            }
            if (!user.ok) {
                return { reply: user.reason };
            }

            const context = { channel, user };

            const currentPermission
                = (await permissions.getDbLocalPermission(channel.id, user.id)) ?? 'normal';

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
