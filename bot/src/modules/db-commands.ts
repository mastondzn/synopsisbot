import { type Prisma } from '@synopsis/db';

import { getCommandPermissions } from '~/helpers/command';
import { type BotModule } from '~/types/client';

export const module: BotModule = {
    name: 'db-commands',
    priority: 0,
    register: async ({ commands, db }) => {
        const commandsToInsert = commands.map((command) => {
            const permission = getCommandPermissions(command);

            return {
                name: command.name,
                description: command.description ?? null,
                aliases: command.aliases ?? [],
                usage: command.usage ?? null,
                ...(command.cooldown?.user ? { userCooldown: command.cooldown.user } : {}),
                ...(command.cooldown?.global ? { globalCooldown: command.cooldown.global } : {}),
                ...(command.permission?.mode ? { permissionMode: command.permission.mode } : {}),

                localPermission: permission.local,
                globalPermission: permission.global,
            } satisfies Prisma.CommandCreateInput;
        });

        const upsertAgs: Prisma.CommandUpsertArgs[] = commandsToInsert.map((command) => {
            return { where: { name: command.name }, create: command, update: command };
        });

        await db.$transaction(upsertAgs.map((args) => db.command.upsert(args)));
        console.log('[module:db-commands] set commands info in db');
    },
};
