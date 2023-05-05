import { channelSchema } from '~/helpers/zod';
import { type BotCommand } from '~/types/client';

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
        'manage unban <user>',
    ].join('\n'),

    run: async ({ params, reply, msg, utils: { idLoginPairs, permissions } }) => {
        const command = params.list.at(0)?.toLowerCase();

        if (
            command !== 'ban' && //
            command !== 'unban'
        ) {
            return await reply('Invalid subcommand.');
        }

        if (command === 'ban' || command === 'unban') {
            const user = params.list.at(1)?.toLowerCase().replace('@', '');
            const userSchemaResult = channelSchema.safeParse(user);

            if (!userSchemaResult.success || !user) {
                return await reply('Invalid user.');
            }

            const isBroadcaster = msg.channelName === user;
            const isSelf = msg.senderUsername === user;

            if (isBroadcaster) return await reply(`You can't ban the broadcaster.`);

            if (isSelf) return await reply(`You can't ban yourself.`);

            const channel = msg.channelName;
            const channelId = msg.channelID;
            const userId = await idLoginPairs.getId(user);

            if (!userId) return await reply(`User ${user} not found.`);

            const isAmbassador =
                (await permissions.getDbLocalPermission(channelId, userId)) === 'ambassador';
            if (isAmbassador) return await reply(`You can't ban ${user}.`);

            const isOwner = (await permissions.getGlobalPermission(userId)) === 'owner';
            if (isOwner) return await reply(`You can't ban ${user}.`);

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

            if (command === 'ban') {
                await permissions.setLocalPermission('banned', context);
                return await reply(`Banned user ${user} from using the bot in this channel.`);
            }

            // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
            if (command === 'unban') {
                await permissions.setLocalPermission('normal', context);
                return await reply(`Unbanned user ${user} from using the bot in this channel.`);
            }

            return;
        }
    },
};
