export type SomeCallback = (...args: unknown[]) => unknown;

export type Resolvable<T> = T | (() => T) | Promise<T> | (() => Promise<T>);
