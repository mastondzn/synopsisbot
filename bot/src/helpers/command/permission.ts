import type { BasicCommand } from '.';
import type { GlobalLevel, LocalLevel } from '~/providers';

export function getCommandPermissions(command: BasicCommand): {
    global: GlobalLevel;
    local: LocalLevel;
    mode: 'all' | 'custom' | 'any';
} {
    const {
        permissions: {
            local = 'normal',
            global = 'normal',
            mode = 'all',
        } = {
            local: 'normal',
            global: 'normal',
            mode: 'all',
        },
    } = command;

    return {
        global,
        local,
        mode,
    };
}
