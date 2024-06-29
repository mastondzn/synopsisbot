/**
 * Throw this error in the context of a command to notify the user that he has made an error in its usage.
 * Use the option to reset the cooldown of the command.
 */
export class UserError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'UserError';
    }
}
