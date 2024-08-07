import { wait } from './wait';

export interface RetryOptions {
    retries: number;
    delay?: number;
    onRetry?: (error: Error, attempt: number) => void;
}

export async function retry<T>(
    fn: () => PromiseLike<T> | T,
    { retries, delay, onRetry }: RetryOptions,
): Promise<Awaited<T>> {
    let lastError: Error | undefined;
    for (let index = 0; index < retries; index++) {
        try {
            return await fn();
        } catch (error) {
            lastError = error instanceof Error ? error : new Error('Unknown error');

            onRetry?.(lastError, index);
            if (delay) await wait(delay);
        }
    }

    // eslint-disable-next-line ts/no-non-null-assertion
    throw lastError!;
}
