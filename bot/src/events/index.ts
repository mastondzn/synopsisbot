import { readdir } from 'node:fs/promises';

import { Collection } from '@discordjs/collection';

import type { BotEventHandler } from '~/types/client';

export const events = await getEventHandlers();

async function getEventHandlers(): Promise<Collection<string, BotEventHandler>> {
    const allFiles = await readdir('./src/events');
    const files = allFiles
        .filter(file => file !== 'index.ts')
        .map(file => file.replace('.ts', ''));

    const events = await Promise.all(
        files.map(async (file) => {
            const eventObject = (await import(`./${file}`)) as { event: BotEventHandler };

            // eslint-disable-next-line ts/no-unnecessary-condition
            if (!eventObject?.event?.event && typeof eventObject?.event?.handler !== 'function') {
                throw new TypeError(`Invalid event ${file}`);
            }

            return { event: eventObject.event, fileName: file };
        }),
    );

    return new Collection<string, BotEventHandler>(
        events.map(({ event, fileName }) => [fileName, event]),
    );
}
