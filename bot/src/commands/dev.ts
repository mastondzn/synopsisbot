// eslint-disable-next-line unicorn/prevent-abbreviations
import { inspect } from 'node:util';

import { Collection } from '@discordjs/collection';

import type { CommandMetadata } from '.';
import { commands } from '.';
import type { Command } from '~/helpers/command';
import { defineCommand } from '~/helpers/command';

export default defineCommand({
    name: 'dev',
    description: 'Lets the owner do some things.',
    subcommands: [{
        path: ['eval'],
        permissions: {
            global: 'owner',
            mode: 'all',
        },
        run: async ({ parameters }) => {
            if (!parameters.text) {
                return { reply: 'No code to eval.' };
            };

            // eslint-disable-next-line no-eval
            const result: unknown = await eval(parameters.text);
            const inspected = inspect(result, {
                depth: 3,
                colors: false,
                breakLength: Number.POSITIVE_INFINITY,
            });

            return { reply: inspected };
        },
    }, {
        path: ['reload'],
        permissions: {
            global: 'owner',
            mode: 'all',
        },
        run: async () => {
            const old = commands.clone();
            await commands.reload();
            const difference = new Collection<string, Command & { meta: CommandMetadata; }>();

            for (const [key, value] of commands) {
                const oldCommand = old.get(key);
                if (!oldCommand || !oldCommand.meta.hash.equals(value.meta.hash)) {
                    difference.set(key, value);
                }
            }

            const lines = ['Reloaded commands,'];

            if (difference.size === 0) {
                lines.push('looks like nothing changed.');
            } else {
                lines.push(
                    difference.size === 1
                        ? 'one command was changed:'
                        : `${difference.size} commands were changed:`,
                    `${[...difference.values()].map(command => command.name).join(', ')}.`,
                );
            }

            return { reply: lines.join(' ') };
        },
    }],
});
