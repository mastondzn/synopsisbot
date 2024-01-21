import type { BasicCommand, CommandPermission } from '.';

export function simplifyCommandPermissions(command: BasicCommand): Required<CommandPermission>[] {
    const defaults: Required<CommandPermission> = {
        global: 'normal',
        local: 'normal',
    };

    if (!command.permissions) return [defaults];

    if (!Array.isArray(command.permissions)) {
        if ('mode' in command.permissions) return [{ mode: 'custom' }];

        return [{ ...defaults, ...command.permissions }];
    }

    return command.permissions.map((permission) => {
        if ('mode' in permission) return { mode: 'custom' };

        return {
            ...defaults,
            ...permission,
        };
    });
}
