import { readdir } from 'node:fs/promises';

import { Collection } from '@discordjs/collection';

import type { BotModule } from '~/helpers/module';

class Modules extends Collection<string, BotModule> {
    public async load(): Promise<this> {
        const directory = (await readdir('./src/modules')).filter((path) => path !== 'index.ts');

        await Promise.all(
            directory.map(async (file) => {
                const importable = file.replace('.ts', '');
                const existing = this.get(importable);
                if (existing) return;

                const imported = (await import(`./${file}`)) as { default: BotModule };

                // eslint-disable-next-line ts/no-unnecessary-condition
                if (!imported.default.register) {
                    throw new TypeError(`Invalid cron ${file}`);
                }
                this.set(file, imported.default);
            }),
        );

        return this;
    }

    async registerModules(): Promise<void> {
        await this.load();

        const orderedModules = [...this.values()].sort((a, b) => {
            if (!('priority' in a) && !('priority' in b)) return 0;
            if (!('priority' in a)) return 1;
            if (!('priority' in b)) return -1;
            if (a.priority === b.priority) return 0;
            return a.priority < b.priority ? 1 : -1;
        });

        for (const module of orderedModules) {
            await module.register();
        }
    }
}

export const modules = new Modules();
