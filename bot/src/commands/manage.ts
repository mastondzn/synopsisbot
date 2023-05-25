import { parseUserParameter, runDeepCommand } from '~/helpers/command';
import { type BotCommand, type CommandFragment } from '~/types/client';

export const command: BotCommand = {
    name: 'manage',
    description: 'Lets ambassadors or broadcasters manage the bot in their channels.',
    permission: {
        local: 'ambassador',
        global: 'owner',
        mode: 'any',
    },
    usage: [
        'manage ban <user>', //
        'Sets the user to banned permission, preventing them from using the bot in the current channel.',

        'manage unban <user>',
        'Sets the user to normal permission, re-allowing them to use the bot in the current channel.',
    ].join('\n'),

    async *run(ctx): AsyncGenerator<CommandFragment> {
        const {
            msg,
            utils: { permissions },
        } = ctx;

        const user = await parseUserParameter(ctx, 1, true);
        if (!user.ok) {
            return yield { reply: user.reason };
        }

        const isBroadcaster = msg.channelName === user.login;
        const isSelf = msg.senderUsername === user.login;
        if (isBroadcaster) return yield { reply: "You can't ban the broadcaster." };
        if (isSelf) return yield { reply: "You can't ban yourself." };

        const channel = { login: msg.channelName, id: msg.channelID };

        const isAmbassador =
            (await permissions.getDbLocalPermission(channel.id, user.id)) === 'ambassador';
        if (isAmbassador) return yield { reply: `You can't ban ${user.login}.` };

        const isOwner = (await permissions.getGlobalPermission(user.id)) === 'owner';
        if (isOwner) return yield { reply: `You can't ban ${user.login}.` };

        const context = { channel, user };

        const currentPermission =
            (await permissions.getDbLocalPermission(channel.id, user.id)) ?? 'normal';

        return runDeepCommand({
            ctx,
            commands: {
                ban: async () => {
                    if (currentPermission === 'banned') {
                        return {
                            reply: `User ${user.login} is already banned from using the bot locally.`,
                        };
                    }
                    await permissions.setLocalPermission('banned', context);
                    return {
                        reply: `Banned user ${user.login} from using the bot in this channel.`,
                    };
                },

                unban: async () => {
                    if (currentPermission === 'normal') {
                        return {
                            reply: `User ${user.login} is not currently banned from using the bot locally.`,
                        };
                    }
                    await permissions.setLocalPermission('normal', context);
                    return {
                        reply: `Unbanned user ${user.login} from using the bot in this channel.`,
                    };
                },
            },
            onNotFound: () => ({
                reply: 'Invalid subcommand.',
            }),
        });
    },
};
