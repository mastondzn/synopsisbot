import type { Buffer } from 'node:buffer';
import { readdir } from 'node:fs/promises';

import { Collection } from '@discordjs/collection';

import type { Command } from '~/helpers/command';
import { computeMetaHash } from '~/helpers/hash';

export interface CommandMetadata {
    version: Date;
    hash: Buffer;
};

class Commands extends Collection<string, Command & { meta: CommandMetadata; }> {
    public async reload(): Promise<this> {
        const directory = (await readdir('./src/commands')).filter(path => path !== 'index.ts');
        const version = new Date();

        await Promise.all(
            directory.map(async (file) => {
                // bypasses the esm cache when reloading
                const importable = file.replace('.ts', '');
                const existing = this.get(importable);
                const hash = await computeMetaHash(`src/commands/${file}`);
                if (existing && existing.meta.hash.equals(hash)) return;

                const imported = (await import(`./${file}?version=${version.getTime()}`)) as { default: Command; };
                if (!imported.default.name) throw new TypeError(`Invalid command ${file}`);

                this.set(file, Object.assign(
                    imported.default,
                    { meta: {
                        version,
                        hash,
                    } },
                ));
            }),
        );

        return this;
    }

    async verify(): Promise<this> {
        if (this.size === 0) await this.reload();
        return this;
    }
}

export const commands = new Commands();
