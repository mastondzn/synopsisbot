import {
    type CommandPermissionMode,
    type GlobalPermissionLevel,
    type LocalPermissionLevel,
} from '@synopsis/db';

import { type BotCommand } from '~/types/client';

export function getCommandPermissions(command: BotCommand): {
    global: GlobalPermissionLevel;
    local: LocalPermissionLevel;
    mode: CommandPermissionMode;
} {
    const wantedPermissions: {
        global: GlobalPermissionLevel;
        local: LocalPermissionLevel;
    } = {
        global: 'NORMAL',
        local: 'NORMAL',
    };

    if (command.permission && command.permission.mode !== 'CUSTOM' && command.permission.local) {
        wantedPermissions.local = command.permission.local;
    }
    if (command.permission && command.permission.mode !== 'CUSTOM' && command.permission.global) {
        wantedPermissions.global = command.permission.global;
    }

    const permissionMode = command.permission?.mode ?? 'ALL';

    return { ...wantedPermissions, mode: permissionMode };
}
