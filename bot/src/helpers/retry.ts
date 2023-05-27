import { wait } from './functions';

export interface RetryOptions {
    retries: number;
    delay?: number;
    onRetry?: (error: Error, attempt: number) => void;
}

export async function retry<T>(
    fn: () => PromiseLike<T> | T,
    { retries, delay, onRetry }: RetryOptions
): Promise<Awaited<T>> {
    let lastError: Error | undefined;
    for (let i = 0; i < retries; i++) {
        try {
            return await fn();
        } catch (error) {
            lastError = error instanceof Error ? error : new Error('Unknown error');

            if (onRetry) onRetry(lastError, i);
            if (delay) await wait(delay);
        }
    }

    throw lastError!;
}
