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
            const result = await fn();

            // eslint-disable-next-line @typescript-eslint/no-unsafe-return
            return result;
        } catch (error) {
            lastError = error instanceof Error ? error : new Error('Unknown error');

            if (onRetry) onRetry(lastError, i);
            if (delay) await wait(delay);
        }
    }

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    throw lastError!;
}
