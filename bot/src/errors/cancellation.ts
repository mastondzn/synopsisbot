// eslint-disable-next-line ts/no-empty-interface
export interface CancellationErrorOptions {}

const defaults: CancellationErrorOptions = {};

/**
 * Throw this error in the context of a command to cancel its execution, not notifying the user.
 * Use the option to choose if the user still gets the cooldown of the command.
 */
export class CancellationError extends Error {
    public readonly options: CancellationErrorOptions;
    constructor(options?: CancellationErrorOptions) {
        super('cancellation error');
        this.options = { ...defaults, ...options };
        this.name = 'CancellationError';
    }
}
