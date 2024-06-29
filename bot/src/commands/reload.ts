import { Collection } from '@discordjs/collection';

import { type CommandMetadata, commands } from '.';
import { createCommand } from '~/helpers/command/define';
import type { Command } from '~/helpers/command/types';

export default createCommand({
    name: 'reload',
    description: 'Reloads commands.',
    permissions: {
        global: 'owner',
    },
    run: async () => {
        const old = commands.clone();
        await commands.load({ force: true });
        const difference = new Collection<string, Command & { meta: CommandMetadata }>();

        for (const [key, value] of commands) {
            const oldCommand = old.get(key);
            if (!oldCommand?.meta.hash.equals(value.meta.hash)) {
                difference.set(key, value);
            }
        }

        if (difference.size === 0) {
            return {
                reply: `Reloaded commands, looks like nothing changed.`,
            };
        }

        if (difference.size === 1) {
            return {
                reply: `Reloaded commands, one command was changed: ${difference.first()?.name}.`,
            };
        }

        return {
            reply: `Reloaded commands, ${difference.size} commands were changed: ${difference
                .map((command) => command.name)
                .join(', ')}.`,
        };
    },
});
