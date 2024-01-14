import { readdir } from 'node:fs/promises';

import { Collection } from '@discordjs/collection';

import type { Command } from '~/helpers/command';

export const commands = new Collection<string, Command>();

await importCommands();
async function importCommands() {
    const allFiles = await readdir('./src/commands');
    const files = allFiles
        .filter(file => file !== 'index.ts')
        .map(file => file.replace('.ts', ''));

    await Promise.all(
        files.map(async (file) => {
            const imported = (await import(`./${file}`)) as { default: Command; };

            // necessary to check dangerous assertion :(
            // eslint-disable-next-line ts/no-unnecessary-condition
            if (!('run' in imported?.default) || !('subcommands' in imported?.default)) {
                throw new TypeError(`Invalid command ${file}`);
            }

            commands.set(file, imported.default);
        }),
    );
}
