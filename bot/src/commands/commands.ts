import { commands } from '.';
import { createCommand } from '~/helpers/command';

export default createCommand({
    name: 'commands',
    description: 'List commands available to you.',
    run: () => {
        const availableCommands = commands.map((command) => command.name).join(', ');

        return {
            reply: `Commands currently available: ${availableCommands}.`,
        };
    },
});
