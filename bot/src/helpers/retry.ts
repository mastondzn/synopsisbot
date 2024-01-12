import { wait } from './functions';

export interface RetryOptions {
    retries: number
    delay?: number
    onRetry?: (error: Error, attempt: number) => void
}

export async function retry<T>(
    function_: () => PromiseLike<T> | T,
    { retries, delay, onRetry }: RetryOptions,
): Promise<Awaited<T>> {
    let lastError: Error | undefined;
    for (let index = 0; index < retries; index++) {
        try {
            return await function_();
        }
        catch (error) {
            lastError = error instanceof Error ? error : new Error('Unknown error');

            if (onRetry) {
                onRetry(lastError, index);
            }
            if (delay) {
                await wait(delay);
            }
        }
    }

    // eslint-disable-next-line no-throw-literal
    throw lastError!;
}
