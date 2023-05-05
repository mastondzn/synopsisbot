import { type PrivmsgMessage } from '@kararty/dank-twitch-irc';

import { type BotCommand } from '~/types/client';
import { type GlobalLevel, type LocalLevel } from '~/utils/permissions';

export const parseCommandParams = (message: string | PrivmsgMessage) => {
    const text = typeof message === 'string' ? message : message.messageText;

    const [prefix, command, ...list] = text.split(' ');
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
