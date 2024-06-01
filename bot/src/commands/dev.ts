// eslint-disable-next-line unicorn/prevent-abbreviations
import { inspect } from 'node:util';

import { Collection } from '@discordjs/collection';

import { type CommandMetadata, commands } from '.';
import { createCommand } from '~/helpers/command/define';
import type { Command } from '~/helpers/command/types';

export default createCommand({
    name: 'dev',
    description: 'Lets the owner do some things.',
    permissions: { global: 'owner' },
    subcommands: [
        {
            path: ['eval'],
            run: async ({ parameters }) => {
                if (!parameters.text) {
                    return { reply: 'No code to eval.' };
                }

                // eslint-disable-next-line no-eval
                const result: unknown = await eval(parameters.text);

                const inspected = inspect(result, {
                    depth: 2,
                    colors: false,
                    breakLength: Number.POSITIVE_INFINITY,
                }).replaceAll('\n', ' ');

                if (inspected.length > 475) {
                    return { reply: `${inspected.slice(0, 475)}... (too long)` };
                }

                return { reply: inspected };
            },
        },
        {
            path: ['reload'],
            run: async () => {
                const old = commands.clone();
                await commands.load(true);
                const difference = new Collection<string, Command & { meta: CommandMetadata }>();

                for (const [key, value] of commands) {
                    const oldCommand = old.get(key);
                    if (!oldCommand || !oldCommand.meta.hash.equals(value.meta.hash)) {
                        difference.set(key, value);
                    }
                }

                if (difference.size === 0) {
                    return { reply: `Reloaded commands, looks like nothing changed.` };
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
        },
    ],
});
