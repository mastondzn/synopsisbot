import { type NewCommand, commands as commandsTable } from '@synopsis/db';

import { commands } from '~/commands';
import { defineModule } from '~/helpers/module';
import { db } from '~/services/database';

export default defineModule({
    name: 'db-commands',
    priority: 0,
    register: async () => {
        await commands.verify();

        const databaseCommands = commands.map((command) => {
            return {
                name: command.name,
                description: command.description ?? null,
                aliases: command.aliases ?? null,
                usage: command.usage ?? null,
                ...(command.cooldown?.user ? { userCooldown: command.cooldown.user } : {}),
                ...(command.cooldown?.global ? { globalCooldown: command.cooldown.global } : {}),
            } satisfies NewCommand;
        });

        for (const command of databaseCommands) {
            await db
                .insert(commandsTable) //
                .values(command)
                .onConflictDoUpdate({
                    target: commandsTable.name,
                    set: command,
                });
        }

        console.log('[module:db-commands] set commands info in db');
    },
});
