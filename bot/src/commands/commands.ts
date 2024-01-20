import { commands } from '.';
import { defineCommand } from '~/helpers/command';

export default defineCommand({
    name: 'commands',
    description: 'List commands available to you.',
    run: () => {
        const availableCommands = commands.map((command) => command.name).join(', ');

        return {
            reply: `Commands currently available: ${availableCommands}.`,
        };
    },
});
