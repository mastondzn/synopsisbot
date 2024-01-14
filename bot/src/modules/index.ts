import { readdir } from 'node:fs/promises';

import { Collection } from '@discordjs/collection';

import type { BotModule } from '~/helpers/module';

export const modules = new Collection<string, BotModule>();

await importModules();
async function importModules() {
    const allFiles = await readdir('./src/modules');
    const files = allFiles
        .filter(file => file !== 'index.ts')
        .map(file => file.replace('.ts', ''));

    await Promise.all(
        files.map(async (file) => {
            const imported = (await import(`./${file}`)) as { default?: BotModule; };

            // necessary to check dangerous assertion :(

            if (typeof imported.default?.register !== 'function') {
                throw new TypeError(`Invalid module ${file}`);
            }

            modules.set(file, imported.default);
        }),
    );
}
