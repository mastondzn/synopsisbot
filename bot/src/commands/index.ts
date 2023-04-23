import { readdir } from 'node:fs/promises';

import { Collection } from '@discordjs/collection';

import { type BotCommand } from '~/types/client';

export const getCommands = async (): Promise<Collection<string, BotCommand>> => {
    const allFiles = await readdir('./src/commands');
    const files = allFiles
        .filter((file) => file !== 'index.ts')
        .map((file) => file.replace('.ts', ''));

    const commands = await Promise.all(
        files.map(async (file) => {
            const commandObj = (await import(`./${file}`)) as { command: BotCommand };

            // necessary to check dangerous assertion :(
            // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
            if (!commandObj?.command?.run && typeof commandObj?.command?.run !== 'function') {
                throw new TypeError(`Invalid command ${file}`);
            }

            return { command: commandObj.command, fileName: file };
        })
    );

    return new Collection<string, BotCommand>(
        commands.map(({ fileName, command }) => [fileName, command])
    );
};
