import { commands as commandsTable, type NewCommand } from '@synopsis/db';

import { type BotModule } from '~/types/client';

export const module: BotModule = {
    name: 'db-commands',
    priority: 0,
    register: async ({ commands, db }) => {
        const dbCommands = commands.map((command) => {
            const permission =
                command.permission?.mode === 'all' || command.permission?.mode === 'any'
                    ? {
                          local: command.permission.local,
                          global: command.permission.global,
                      }
                    : ({ local: 'normal', global: 'normal' } as const);

            return {
                name: command.name,
                description: command.description ?? null,
                aliases: command.aliases ?? null,
                usage: command.usage ?? null,
                ...(command.cooldown?.user ? { userCooldown: command.cooldown.user } : {}),
                ...(command.cooldown?.global ? { globalCooldown: command.cooldown.global } : {}),
                ...(command.permission?.mode ? { permissionMode: command.permission.mode } : {}),

                ...(permission.local ? { localPermission: permission.local } : {}),
                ...(permission.global ? { globalPermission: permission.global } : {}),
            } satisfies NewCommand;
        });

        for (const command of dbCommands) {
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
};
