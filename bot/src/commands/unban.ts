import { createCommand } from '~/helpers/command/define';
import { schemas } from '~/helpers/schemas';
import { permissions } from '~/providers/permissions';
import { helix } from '~/services/apis/helix';

export default createCommand({
    name: 'unban',
    description: 'Unbans a user from using the bot.',
    permissions: [
        { local: 'ambassador' }, //
        { global: 'owner' },
    ],
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

        const targetIsSelf = user.login === target;
        if (targetIsSelf) {
            return { reply: "You can't unban yourself." };
        }

        const targetIsBroadcaster = target === wantedChannel.name;
        if (targetIsBroadcaster) {
            return { reply: "You can't unban the broadcaster." };
        }

        const targetIsBotOwner = (await permissions.getGlobalPermission(targetUser.id)) === 'owner';
        if (targetIsBotOwner) {
            return { reply: `You can't ban ${targetUser.displayName}, as they are a bot owner.` };
        }

        const currentTargetPermission =
            (await permissions.getDbLocalPermission(wantedChannel.id, targetUser.id)) ?? 'normal';

        if (currentTargetPermission !== 'banned') {
            return {
                reply: `You can't unban ${targetUser.displayName} as they are not banned from using the bot locally.`,
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
