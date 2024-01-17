import type { Collection } from '@discordjs/collection';

import type { BotModule } from '.';

export async function registerModules(modules: Collection<string, BotModule>): Promise<void> {
    const orderedModules = [...modules.values()].sort((a, b) => {
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
