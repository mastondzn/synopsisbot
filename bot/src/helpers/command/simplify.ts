import { equals } from 'ramda';

import type { BasicCommand, Command, parseParameters } from '.';

export function simplifyCommand(
    command: Command,
    context: Pick<ReturnType<typeof parseParameters>, 'rest'>,
): BasicCommand | null {
    if ('subcommands' in command) {
        const { subcommands, ...rest } = command;
        const sorted = subcommands.sort((a, b) => b.path.length - a.path.length);
        const subcommand = sorted.find(({ path }) => equals(path, context.rest.slice(0, path.length)));

        if (!subcommand) {
            return null;
        }

        return { ...rest, ...subcommand };
    }

    return command;
}
