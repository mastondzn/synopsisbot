import { type BotCommand } from '~/types/client';
import { type GlobalLevel, type LocalLevel } from '~/utils/permissions';

export function getCommandPermissions(command: BotCommand): {
    global: GlobalLevel;
    local: LocalLevel;
    mode: 'all' | 'custom' | 'any';
} {
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
}
