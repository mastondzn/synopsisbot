import type { PrivmsgMessage } from '@mastondzn/dank-twitch-irc';
import { equals } from 'ramda';

import { prefix } from './prefix';
import type { BasicCommand, Command } from './types';

/**
 * Simplify a command by converting commands with subcommands to a basic command
 * @param command The command to simplify
 * @param message The IRC message to use for this simplification
 * @param message.messageText The text of the IRC message
 */
export function simplifyCommand(
    command: Command,
    { messageText: text }: Pick<PrivmsgMessage, 'messageText'>,
): BasicCommand | null {
    if (!('subcommands' in command)) {
        return command;
    }

    const { subcommands, ...rest } = command;

    // we want to match the longest possible path possible first
    const sorted = subcommands.sort((a, b) => {
        const length = { a: a.path?.length ?? 0, b: b.path?.length ?? 0 };
        return length.b - length.a;
    });

    const messagePath = text.replace(prefix, '').split(/\s+/);

    const subcommand = sorted.find(({ path = [] }) => {
        return equals(path, messagePath.slice(1, path.length + 1));
    });

    if (!subcommand) {
        return null;
    }

    return Object.assign(rest, subcommand);
}
