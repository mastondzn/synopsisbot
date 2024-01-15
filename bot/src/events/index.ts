import { readdir } from 'node:fs/promises';

import { Collection } from '@discordjs/collection';

import type { BotEventHandler } from '~/helpers/event';

let old: Collection<string, BotEventHandler> | null = null;

export async function getEventHandlers(force = false) {
    if (!force && old) return old;

    const events = new Collection<string, BotEventHandler>();

    const allFiles = await readdir('./src/events');
    const files = allFiles
        .filter(file => file !== 'index.ts')
        .map(file => file.replace('.ts', ''));

    await Promise.all(
        files.map(async (file) => {
            const imported = (await import(`./${file}`)) as { default?: BotEventHandler; };

            // necessary to check dangerous assertion :(
            // eslint-disable-next-line ts/no-unnecessary-condition
            if (!imported?.default?.event && typeof imported?.default?.handler !== 'function') {
                throw new TypeError(`Invalid event ${file}`);
            }

            events.set(file, imported.default);
        }),
    );

    old = events;
    return events;
}
