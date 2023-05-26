import { getCommandPermissions } from '~/helpers/command';
import { type BotCommand } from '~/types/client';
import { pleasesGlobal, pleasesLocal } from '~/utils/permissions';

export const command: BotCommand = {
    name: 'commands',
    description: 'List commands available to you.',
    run: async ({ msg, commands, utils: { permissions } }) => {
        const { local, global } = await permissions.getPermission(msg);

        const availableCommands = commands
            .filter((command) => {
                const wantedPermissions = getCommandPermissions(command);

                if (wantedPermissions.mode === 'any')
                    return (
                        pleasesGlobal(wantedPermissions.global, global) ||
                        pleasesLocal(wantedPermissions.local, local)
                    );
                if (wantedPermissions.mode === 'all')
                    return (
                        pleasesGlobal(wantedPermissions.global, global) &&
                        pleasesLocal(wantedPermissions.local, local)
                    );

                return true;
            })
            .map((command) => command.name)
            .join(', ');

        return { reply: `Commands currently available to you: ${availableCommands}.` };
    },
};
