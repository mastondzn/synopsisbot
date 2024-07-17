export class FeatureNotAvailableError extends Error {
    reason?: string;

    constructor({ message, reason }: { message?: string; reason?: string } = {}) {
        super(message);
        if (reason) this.reason = reason;
    }
}
