// eslint-disable-next-line unicorn/prevent-abbreviations
import { inspect } from 'node:util';

import { Collection } from '@discordjs/collection';

import { type CommandMetadata, commands } from '.';
import { type Command, createCommand } from '~/helpers/command';

export default createCommand({
    name: 'dev',
    description: 'Lets the owner do some things.',
    subcommands: [
        {
            path: ['eval'],
            permissions: { global: 'owner' },
            run: async ({ parameters }) => {
                if (!parameters.text) {
                    return { reply: 'No code to eval.' };
                }

                // eslint-disable-next-line no-eval
                const result: unknown = await eval(parameters.text);
                let inspected =
                    typeof result === 'string'
                        ? result
                        : inspect(result, {
                              depth: 2,
                              colors: false,
                              breakLength: Number.POSITIVE_INFINITY,
                          }).replaceAll('\n', ' ');

                if (inspected.length > 475) {
                    inspected = `${inspected.slice(0, 475)}... (too long)`;
                }

                return { reply: inspected };
            },
        },
        {
            path: ['reload'],
            permissions: { global: 'owner' },
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

                const lines = ['Reloaded commands,'];

                if (difference.size === 0) {
                    lines.push('looks like nothing changed.');
                } else {
                    lines.push(
                        difference.size === 1
                            ? 'one command was changed:'
                            : `${difference.size} commands were changed:`,
                        `${[...difference.values()].map((command) => command.name).join(', ')}.`,
                    );
                }

                return { reply: lines.join(' ') };
            },
        },
    ],
});
