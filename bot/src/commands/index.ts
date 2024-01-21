import type { Buffer } from 'node:buffer';
import { readdir } from 'node:fs/promises';

import { Collection } from '@discordjs/collection';

import type { Command } from '~/helpers/command';
import { computeMetaHash } from '~/helpers/hash';

export interface CommandMetadata {
    version: Date;
    hash: Buffer;
}

class Commands extends Collection<string, Command & { meta: CommandMetadata }> {
    public async load(force = false): Promise<this> {
        const directory = (await readdir('./src/commands')).filter((path) => path !== 'index.ts');

        const version = new Date();

        await Promise.all(
            directory.map(async (file) => {
                const importable = file.replace('.ts', '');
                const existing = this.get(importable);
                if (existing && !force) return;

                const hash = await computeMetaHash(`src/commands/${file}`);
                if (existing && force && existing.meta.hash.equals(hash)) return;

                let path = `./${file}`;
                // bypasses the esm cache when reloading
                if (force) path += `?version=${version.getTime()}`;

                const imported = (await import(path)) as { default: Command };
                if (!imported.default.name) throw new TypeError(`Invalid command ${file}`);

                this.set(file, Object.assign(imported.default, { meta: { version, hash } }));
            }),
        );

        return this;
    }

    public findByName(name: string) {
        return this.find((c) => c.name === name || c.aliases?.includes(name));
    }
}

export const commands = new Commands();
