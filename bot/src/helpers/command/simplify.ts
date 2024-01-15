import type { PrivmsgMessage } from '@kararty/dank-twitch-irc';
import { equals } from 'ramda';

import { parseParameters } from '.';
import type { BasicCommand, Command } from '.';

export function parseCommand(
    command: Command,
    message: string | PrivmsgMessage,
) {
    const text = typeof message === 'string' ? message : message.messageText;

    const parameters = parseParameters(text);

    let path: string[] | null = null;
    if ('subcommands' in command) {
        const { subcommands, ...rest } = command;
        const sorted = subcommands.sort((a, b) => b.path.length - a.path.length);
        const subcommand = sorted.find(
            ({ path }) => equals(path, parameters.rest.slice(0, path.length)),
        );

        if (!subcommand) return null;

        path = subcommand.path;
        command = { ...rest, ...subcommand };
    }

    return {
        parameters: {
            ...parameters,
            text: (path?.length
                ? parameters.rest.slice(path.length).join(' ')
                : parameters.text) ?? null,
            rest: path?.length
                ? parameters.rest.slice(path.length)
                : parameters.rest,
            path,
        },
        command: command as BasicCommand,
    };
}
