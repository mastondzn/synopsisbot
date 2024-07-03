import { commands } from '.';
import { create } from '~/helpers/creators';

export default create.command({
    name: 'commands',
    description: 'List commands available to you.',
    run: () => {
        const availableCommands = commands.map((command) => command.name).join(', ');

        return {
            reply: `Commands currently available: ${availableCommands}.`,
        };
    },
});
