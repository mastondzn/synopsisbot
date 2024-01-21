import { Hono } from 'hono';

import { commands } from '~/commands';

export const route = new Hono().get('/', async ({ json }) => {
    await commands.load();

    const list = commands.map((command) => {
        const hasSubcommands = 'subcommands' in command;

        return {
            name: command.name,
            description: command.description,
            aliases: command.aliases,
            usage: command.usage,
            cooldown: command.cooldown,
            permissions: hasSubcommands ? ('unknown' as const) : command.permissions,
        };
    });

    return json({ data: list }, { status: 200 });
});
