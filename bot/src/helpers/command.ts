import { type PrivmsgMessage } from '@kararty/dank-twitch-irc';

import { type BotCommand, type BotCommandContext, type BotCommandFunction } from '~/types/client';
import { type GlobalLevel, type LocalLevel } from '~/utils/permissions';

export const parseCommandParams = (message: string | PrivmsgMessage) => {
    const text = typeof message === 'string' ? message : message.messageText;

    const [prefix, command, ...list] = text.split(/ +/);
    if (!prefix || !command) throw new Error('Failed to parse command');
    return { prefix, command, list, text: text.replace(`${prefix} ${command}`, '').trim() || null };
};

export const getCommandPermissions = (
    command: BotCommand
): {
    global: GlobalLevel;
    local: LocalLevel;
    mode: 'all' | 'custom' | 'any';
} => {
    const wantedPermissions: {
        global: GlobalLevel;
        local: LocalLevel;
    } = {
        global: 'normal',
        local: 'normal',
    };

    if (command.permission && command.permission.mode !== 'custom' && command.permission.local) {
        wantedPermissions.local = command.permission.local;
    }
    if (command.permission && command.permission.mode !== 'custom' && command.permission.global) {
        wantedPermissions.global = command.permission.global;
    }

    const permissionMode = command.permission?.mode ?? 'all';

    return { ...wantedPermissions, mode: permissionMode };
};

export interface DeepCommandRecord {
    [key: string]: BotCommandFunction | DeepCommandRecord;
}

export const runDeepCommand = ({
    ctx,
    commands,
    onNotFound,
}: {
    ctx: BotCommandContext;
    commands: DeepCommandRecord;
    onNotFound: BotCommandFunction;
}): Promise<void> | void => {
    const params = ctx.params.list;
    const paths = getPaths(commands);

    let command: DeepCommandRecord | BotCommandFunction | undefined = commands;
    for (const path of paths) {
        const desiredPath = params.slice(0, path.length);
        if (path.join(' ') === desiredPath.join(' ')) {
            for (const accessor of desiredPath) {
                command = (command as DeepCommandRecord)[accessor];
            }
            break;
        }
    }

    if (!command) command = onNotFound;
    if (typeof command !== 'function') throw new Error('Command not found');

    return command(ctx);
};

export const getPaths = (subcommands: DeepCommandRecord): string[][] => {
    const paths: string[][] = [];

    const keys = Object.keys(subcommands);
    for (const key of keys) {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const value = subcommands[key]!;
        if (typeof value === 'function') {
            paths.push([key]);
        } else {
            const subPaths = getPaths(value);
            for (const path of subPaths) {
                paths.push([key, ...path]);
            }
        }
    }

    return paths;
};
