import { readdir } from 'node:fs/promises';

import { Collection } from '@discordjs/collection';

import { type BotModule } from '~/types/client';

export const getModules = async (): Promise<Collection<string, BotModule>> => {
    const allFiles = await readdir('./src/modules');
    const files = allFiles
        .filter((file) => file !== 'index.ts')
        .map((file) => file.replace('.ts', ''));

    const events = await Promise.all(
        files.map(async (file) => {
            const moduleObj = (await import(`./${file}`)) as { module: BotModule };

            // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
            if (!moduleObj?.module?.register && typeof moduleObj?.module?.register !== 'function') {
                throw new TypeError(`Invalid event ${file}`);
            }

            return { module: moduleObj.module, fileName: file };
        })
    );

    return new Collection<string, BotModule>(
        events.map(({ module, fileName }) => [fileName, module])
    );
};
