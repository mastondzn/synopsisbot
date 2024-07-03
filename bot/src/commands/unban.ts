import { z } from 'zod';

import { PermissionError } from '~/errors/permission';
import { create } from '~/helpers/creators';
import { schemas } from '~/helpers/schemas';
import { type PermissionContext, permissions } from '~/providers/permissions';
import { helix } from '~/services/apis/helix';

export default create.command({
    name: 'unban',
    description: 'Unbans a user from using the bot.',
    permissions: 'custom',
    usage: [
        ['unban <user>', 'Unbans the user from using the bot, in the current channel.'],
        [
            'unban <user> in:<channel>',
            'Unbans the user from using the bot, in the specified channel.',
        ],
    ],

    options: {
        channel: {
            schema: schemas.twitch.login().optional(),
            aliases: ['in', 'c'],
        },
    },
    arguments: z.tuple([schemas.twitch.login()]),

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
            return { reply: "You can't unban yourself." };
        }

        if (target === wantedChannel.name) {
            return { reply: "You can't unban the broadcaster." };
        }

        const targetPermissions = await permissions.getPermissions({
            channel: { id: wantedChannel.id, login: wantedChannel.name },
            user: { id: targetUser.id, login: targetUser.name },
            messageLevel: null,
        });

        if (targetPermissions.local !== 'banned') {
            return {
                reply: `You can't unban ${targetUser.displayName} as they are not banned locally.`,
            };
        }

        await permissions.setLocalPermission('normal', {
            channel: { id: wantedChannel.id, login: wantedChannel.name },
            user: { id: targetUser.id, login: targetUser.name },
        });

        return {
            reply: `Unbanned ${targetUser.displayName} from using the bot in ${wantedChannel.name}.`,
        };
    },
});
