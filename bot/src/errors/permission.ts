import { trim } from '~/helpers/tags';
import type { GlobalLevel, LocalLevel } from '~/providers/permissions';

export const defaultErrorMessage = "You don't have permission to do that.";

export interface PermissionErrorOptions {
    message?: string;
    concatInfo?: boolean;
    announce?: boolean;
    local?: {
        required: LocalLevel;
        current: LocalLevel;
    };
    global?: {
        required: GlobalLevel;
        current: GlobalLevel;
    };
}

export class PermissionError extends Error {
    public readonly options: PermissionErrorOptions;
    constructor(options: PermissionErrorOptions = {}) {
        const actualOptions = Object.assign(options, {
            message: options.message ?? defaultErrorMessage,
        });

        const actualMessage = options.concatInfo
            ? concatInfo(actualOptions)
            : options.message ?? defaultErrorMessage;

        super(actualMessage);
        this.options = options;
        this.name = 'PermissionError';
    }
}

function concatInfo({
    global,
    local,
    message,
}: PermissionErrorOptions & { message: string }): string {
    const parts = [message];
    if (global && local) {
        parts.push(
            trim`
                Local level ${local.current} was expected, but ${local.required} was received, 
                global level ${global.current} was also expected, but ${global.required} was received.
            `,
        );
    } else if (global) {
        parts.push(
            `Global level ${global.current} was expected, but ${global.required} was received.`,
        );
    } else if (local) {
        parts.push(
            `Local level ${local.current} was expected, but ${local.required} was received.`,
        );
    }

    return parts.join(' ');
}
