import { readdir } from 'node:fs/promises';

import { Collection } from '@discordjs/collection';

import type { BotCommand } from '~/types/client';

export async function getCommands(): Promise<Collection<string, BotCommand>> {
    const allFiles = await readdir('./src/commands');
    const files = allFiles
        .filter(file => file !== 'index.ts')
        .map(file => file.replace('.ts', ''));

    const commands = await Promise.all(
        files.map(async (file) => {
            const commandObject = (await import(`./${file}`)) as { command: BotCommand };

            // necessary to check dangerous assertion :(
            // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
            if (!commandObject?.command?.run && typeof commandObject?.command?.run !== 'function') {
                throw new TypeError(`Invalid command ${file}`);
            }

            return { command: commandObject.command, fileName: file };
        }),
    );

    return new Collection<string, BotCommand>(
        commands.map(({ fileName, command }) => [fileName, command]),
    );
}
