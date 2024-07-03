import { readdir } from 'node:fs/promises';

import { Collection } from '@discordjs/collection';
import { CronJob } from 'cron';

import type { Cron } from '~/helpers/cron/types';

class Crons extends Collection<string, Cron & { job?: CronJob }> {
    public async load(): Promise<this> {
        const directory = (await readdir('./src/crons')).filter((path) => path !== 'index.ts');

        await Promise.all(
            directory.map(async (file) => {
                const importable = file.replace('.ts', '');
                const existing = this.get(importable);
                if (existing) return;

                const imported = (await import(`./${file}`)) as { default: Cron };
                if (!imported.default.name) throw new TypeError(`Invalid cron ${file}`);

                this.set(file, imported.default);
            }),
        );

        return this;
    }

    async start(): Promise<void> {
        await this.load();

        for (const cron of this.values()) {
            cron.job?.stop();
            cron.job = CronJob.from({ ...cron, start: true });
        }
    }
}

export const cronJobs = new Crons();
