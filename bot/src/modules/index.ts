import { readdir } from 'node:fs/promises';

import { Collection } from '@discordjs/collection';

import type { BotModule } from '~/types/client';

export const modules = await getModules();

export async function getModules(): Promise<Collection<string, BotModule>> {
    const allFiles = await readdir('./src/modules');
    const files = allFiles
        .filter(file => file !== 'index.ts')
        .map(file => file.replace('.ts', ''));

    const events = await Promise.all(
        files.map(async (file) => {
            const moduleObject = (await import(`./${file}`)) as { module: BotModule };

            // eslint-disable-next-line ts/no-unnecessary-condition
            if (!moduleObject?.module?.register && typeof moduleObject?.module?.register !== 'function') {
                throw new TypeError(`Invalid module ${file}`);
            }

            return { module: moduleObject.module, fileName: file };
        }),
    );

    return new Collection<string, BotModule>(
        events.map(({ module, fileName }) => [fileName, module]),
    );
}
