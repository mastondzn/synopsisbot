import { parseUserParameter } from '~/helpers/command';
import { type BotCommand } from '~/types/client';

export const command: BotCommand = {
    name: 'manage',
    description: 'Lets ambassadors or broadcasters manage the bot in their channels.',
    permission: {
        local: 'AMBASSADOR',
        global: 'OWNER',
        mode: 'ANY',
    },
    usage: [
        'manage ban <user>', //
        'Sets the user to banned permission, preventing them from using the bot in the current channel.',

        'manage unban <user>',
        'Sets the user to normal permission, re-allowing them to use the bot in the current channel.',
    ].join('\n'),

    subcommands: [
        {
            path: ['ban'],
            run: async (ctx) => {
                const {
                    msg,
                    utils: { permissions },
                } = ctx;

                const user = await parseUserParameter(ctx, 1, true);
                if (!user.ok) {
                    return { reply: user.reason };
                }

                const isBroadcaster = msg.channelName === user.login;
                const isSelf = msg.senderUsername === user.login;
                if (isBroadcaster) return { reply: "You can't ban the broadcaster." };
                if (isSelf) return { reply: "You can't ban yourself." };

                const channel = { login: msg.channelName, id: msg.channelID };

                const isAmbassador =
                    (await permissions.getDbLocalPermission(channel.id, user.id)) === 'AMBASSADOR';

                if (isAmbassador) return { reply: `You can't ban ${user.login}.` };

                const isOwner = (await permissions.getGlobalPermission(user.id)) === 'OWNER';

                if (isOwner) return { reply: `You can't ban ${user.login}.` };

                const currentPermission =
                    (await permissions.getDbLocalPermission(channel.id, user.id)) ?? 'normal';

                if (currentPermission === 'BANNED') {
                    return {
                        reply: `User ${user.login} is already banned from using the bot locally.`,
                    };
                }
                await permissions.setLocalPermission('BANNED', {
                    channel,
                    user,
                });
                return {
                    reply: `Banned user ${user.login} from using the bot in this channel.`,
                };
            },
        },
        {
            path: ['unban'],
            run: async (ctx) => {
                const {
                    msg,
                    utils: { permissions },
                } = ctx;

                const user = await parseUserParameter(ctx, 1, true);
                if (!user.ok) {
                    return { reply: user.reason };
                }

                const isBroadcaster = msg.channelName === user.login;
                const isSelf = msg.senderUsername === user.login;
                if (isBroadcaster) return { reply: "You can't ban the broadcaster." };
                if (isSelf) return { reply: "You can't ban yourself." };

                const channel = { login: msg.channelName, id: msg.channelID };

                const isAmbassador =
                    (await permissions.getDbLocalPermission(channel.id, user.id)) === 'AMBASSADOR';
                if (isAmbassador) return { reply: `You can't ban ${user.login}.` };

                const isOwner = (await permissions.getGlobalPermission(user.id)) === 'OWNER';
                if (isOwner) return { reply: `You can't ban ${user.login}.` };

                const currentPermission =
                    (await permissions.getDbLocalPermission(channel.id, user.id)) ?? 'NORMAL';

                if (currentPermission === 'NORMAL') {
                    return {
                        reply: `User ${user.login} is not currently banned from using the bot locally.`,
                    };
                }
                await permissions.setLocalPermission('NORMAL', { channel, user });
                return {
                    reply: `Unbanned user ${user.login} from using the bot in this channel.`,
                };
            },
        },
    ],

    run: () => {
        return {
            reply: "Please specify a subcommand such as 'sb manage ban <user>' or 'sb manage unban <user>'.",
        };
    },
};
