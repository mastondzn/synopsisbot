import { readdir } from 'node:fs/promises';

import { Collection } from '@discordjs/collection';
import type { ChatClient } from '@mastondzn/dank-twitch-irc';

import type { BotEventHandler } from '~/helpers/event';

class EventHandlers extends Collection<string, BotEventHandler> {
    public async load(): Promise<this> {
        const directory = (await readdir('./src/events')).filter((path) => path !== 'index.ts');

        await Promise.all(
            directory.map(async (file) => {
                const importable = file.replace('.ts', '');
                const existing = this.get(importable);
                if (existing) return;

                const imported = (await import(`./${file}`)) as { default: BotEventHandler };
                // eslint-disable-next-line ts/no-unnecessary-condition
                if (!imported.default.handler) {
                    throw new TypeError(`Invalid cron ${file}`);
                }
                this.set(file, imported.default);
            }),
        );

        return this;
    }

    async registerEvents(chat: ChatClient): Promise<void> {
        await this.load();

        for (const [, { event, handler }] of this) {
            chat.on(event, (...parameters) => {
                // @ts-expect-error ts cant realize this is fine
                return void handler(...parameters);
            });
        }
    }
}

export const eventHandlers = new EventHandlers();
