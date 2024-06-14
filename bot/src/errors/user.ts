// eslint-disable-next-line ts/no-empty-interface
export interface UserErrorOptions {}

const defaults: UserErrorOptions = {};

/**
 * Throw this error in the context of a command to notify the user that he has made an error in its usage.
 * Use the option to reset the cooldown of the command.
 */
export class UserError extends Error {
    public readonly options: UserErrorOptions;
    constructor(message: string, options?: UserErrorOptions) {
        super(message);
        this.options = { ...defaults, ...options };
        this.name = 'UserError';
    }
}
