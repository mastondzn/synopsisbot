import { createCommand } from '~/helpers/command/define';
import { schemas } from '~/helpers/schemas';
import { permissions } from '~/providers/permissions';
import { helix } from '~/services/apis/helix';

export default createCommand({
    name: 'ban',
    description: 'Bans a user from using the bot.',
    permissions: [
        { local: 'ambassador' }, //
        { global: 'owner' },
    ],
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

        const targetIsSelf = user.login === target;
        if (targetIsSelf) {
            return { reply: "You can't ban yourself." };
        }

        const targetIsBroadcaster = target === wantedChannel.name;
        if (targetIsBroadcaster) {
            return { reply: "You can't ban the broadcaster." };
        }

        const targetLocalPermission =
            (await permissions.getDbLocalPermission(wantedChannel.id, targetUser.id)) ?? 'normal';
        if (targetLocalPermission === 'ambassador') {
            return {
                reply: `You can't ban ${targetUser.displayName}, as they are an ambassador.`,
            };
        }

        const targetIsBotOwner = (await permissions.getGlobalPermission(targetUser.id)) === 'owner';
        if (targetIsBotOwner) {
            return {
                reply: `You can't ban ${targetUser.displayName}, as they are a bot owner.`,
            };
        }

        if (targetLocalPermission === 'banned') {
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
