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
                userCooldown: command.cooldown?.user ?? null,
                globalCooldown: command.cooldown?.global ?? null,
                permissionMode: command.permission?.mode ?? null,

                localPermission: permission.local ?? null,
                globalPermission: permission.global ?? null,
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
