import { readdir } from 'node:fs/promises';

import { Collection } from '@discordjs/collection';

import type { Command } from '~/helpers/command/types';

class Commands extends Collection<string, Command> {
    public async load(): Promise<void> {
        const directory = (await readdir('./src/commands')).filter((path) => path !== 'index.ts');

        await Promise.all(
            directory.map(async (file) => {
                const importable = file.replace('.ts', '');
                const existing = this.get(importable);
                if (existing) return;

                const imported = (await import(`./${file}`)) as { default: Command };
                if (!imported.default.name) {
                    throw new TypeError(`Invalid command ${file}`);
                }

                this.set(file, imported.default);
            }),
        );
    }

    public findByName(name: string): Command | undefined {
        return this.find((c) => c.name === name || c.aliases?.includes(name));
    }
}

export const commands = new Commands();
