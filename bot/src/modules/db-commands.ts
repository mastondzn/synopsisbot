import { type NewCommand, schema } from '@synopsis/db';

import { commands } from '~/commands';
import { prefixes } from '~/helpers/log-prefixes';
import { defineModule } from '~/helpers/module/define';
import { db } from '~/services';

export default defineModule({
    name: 'db-commands',
    priority: 0,
    register: async () => {
        await commands.load();

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
                .insert(schema.commands) //
                .values(command)
                .onConflictDoUpdate({
                    target: schema.commands.name,
                    set: command,
                });
        }

        console.log(prefixes['db-commands'], 'set commands info in db');
    },
});
