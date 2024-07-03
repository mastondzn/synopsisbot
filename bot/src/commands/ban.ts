import { PermissionError } from '~/errors/permission';
import { create } from '~/helpers/creators';
import { schemas } from '~/helpers/schemas';
import { type PermissionContext, permissions } from '~/providers/permissions';
import { helix } from '~/services/apis/helix';

export default create.command({
    name: 'ban',
    description: 'Bans a user f rom using the bot.',
    permissions: 'custom',
    usage: [
        ['ban <user>', 'Bans the user from using the bot, in the current channel.'],
        ['ban <user> in:<channel>', 'Bans the user from using the bot, in the specified channel.'],
    ],
    options: {
        channel: {
            schema: schemas.twitch.login().optional(),
            aliases: ['in', 'c'],
        },
    },
    arguments: [schemas.twitch.login()],
    run: async ({ user, channel, options, args: [target] }) => {
        const [wantedChannel, targetUser] = await Promise.all([
            helix.users.getUserByName(options.channel ?? channel.login),
            helix.users.getUserByName(target),
        ]);

        if (!wantedChannel) {
            return { reply: 'Channel not found.' };
        }

        if (!targetUser) {
            return { reply: 'User not found.' };
        }

        const context: PermissionContext = {
            channel: { id: wantedChannel.id, login: wantedChannel.name },
            user: { id: user.id, login: user.login },
            messageLevel: null,
        };

        const required = {
            global: 'owner',
            local: 'ambassador',
        } as const;

        const { global, local } = await permissions.satisfiesPermissions(required, context);

        // we want to satisfy either one of the permissions
        const isBanned = global.level === 'banned' || local.level === 'banned';
        if ((!global.satisfies && !local.satisfies) || isBanned) {
            throw new PermissionError({
                message: `You don\'t have the permission to do that ${options.channel ? 'there' : 'here'}.`,
                announce: !(global.level === 'banned' || local.level === 'banned'),
                global: { required: required.global, current: global.level },
                local: { required: required.local, current: local.level },
            });
        }

        if (user.login === target) {
            return { reply: "You can't ban yourself." };
        }

        if (target === wantedChannel.name) {
            return { reply: "You can't ban the broadcaster." };
        }

        const targetPermissions = await permissions.getPermissions({
            channel: { id: wantedChannel.id, login: wantedChannel.name },
            user: { id: targetUser.id, login: targetUser.name },
            messageLevel: null,
        });

        if (targetPermissions.local === 'ambassador') {
            return {
                reply: `You can't ban ${targetUser.displayName}, as they are an ambassador.`,
            };
        }

        if (targetPermissions.global === 'owner') {
            return {
                reply: `You can't ban ${targetUser.displayName}, as they are a bot owner.`,
            };
        }

        if (targetPermissions.local === 'banned') {
            return {
                reply: `User ${targetUser.displayName} is already banned from using the bot locally.`,
            };
        }

        await permissions.setLocalPermission('banned', {
            channel: { id: wantedChannel.id, login: wantedChannel.name },
            user: { id: targetUser.id, login: targetUser.name },
        });

        return {
            reply: `Banned ${targetUser.displayName} from using the bot in ${wantedChannel.name}.`,
        };
    },
});
