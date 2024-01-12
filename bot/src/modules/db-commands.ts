import { type NewCommand, commands as commandsTable } from '@synopsis/db';

import { getCommandPermissions } from '~/helpers/command';
import type { BotModule } from '~/types/client';

export const module: BotModule = {
    name: 'db-commands',
    priority: 0,
    register: async ({ commands, db }) => {
        const databaseCommands = commands.map((command) => {
            const permission = getCommandPermissions(command);

            return {
                name: command.name,
                description: command.description ?? null,
                aliases: command.aliases ?? null,
                usage: command.usage ?? null,
                ...(command.cooldown?.user ? { userCooldown: command.cooldown.user } : {}),
                ...(command.cooldown?.global ? { globalCooldown: command.cooldown.global } : {}),
                ...(command.permission?.mode ? { permissionMode: command.permission.mode } : {}),

                localPermission: permission.local,
                globalPermission: permission.global,
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
};
