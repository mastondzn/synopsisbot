import type { PrivmsgMessage } from '@mastondzn/dank-twitch-irc';
import { equals } from 'ramda';

import type { Command } from '.';

export function parseParameters(message: string | PrivmsgMessage) {
    const text = typeof message === 'string' ? message : message.messageText;

    const split = text.split(/\s+/);
    const [prefix, command = null, ...rest] = split;
    if (!prefix || !command) {
        throw new Error('Failed to parse command');
    }

    return {
        text: rest.join(' ') || null,
        split,
        command,
        prefix,
        rest,
    };
}

export function parseCommand(command: Command, message: string | PrivmsgMessage) {
    const text = typeof message === 'string' ? message : message.messageText;

    const parameters = parseParameters(text);

    let path: string[] | null = null;
    if ('subcommands' in command) {
        const { subcommands, ...rest } = command;
        const sorted = subcommands.sort((a, b) => b.path.length - a.path.length);
        const subcommand = sorted.find(({ path }) =>
            equals(path, parameters.rest.slice(0, path.length)),
        );

        if (!subcommand) return null;

        path = subcommand.path;
        command = { ...rest, ...subcommand };
    }

    return {
        parameters: {
            ...parameters,
            text:
                (path?.length ? parameters.rest.slice(path.length).join(' ') : parameters.text) ??
                null,
            rest: path?.length ? parameters.rest.slice(path.length) : parameters.rest,
            path,
        },
        command,
    };
}
