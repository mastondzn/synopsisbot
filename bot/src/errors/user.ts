export interface UserErrorOptions {
    message?: string;
}

const defaults: UserErrorOptions = {};

/**
 * Throw this error in the context of a command to notify the user that he has made an error in its usage.
 * Use the option to reset the cooldown of the command.
 */
export class UserError extends Error {
    public readonly options: UserErrorOptions;
    constructor(options?: UserErrorOptions) {
        super('user command error');
        this.options = { ...defaults, ...options };
        this.name = 'UserError';
    }
}
