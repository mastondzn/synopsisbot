export type SomeFunction = (...arguments_: unknown[]) => unknown;

export type SomeAsyncFunction = (...arguments_: unknown[]) => Promise<unknown>;

export type Resolvable<T> = T | (() => T) | Promise<T> | (() => Promise<T>);

export type Prettify<T> = {
    [K in keyof T]: T[K];
};

export type RemoveIndexSignature<T> = {
    [K in keyof T as string extends K
        ? never
        : number extends K
            ? never
            : symbol extends K
                ? never
                : K]: T[K];
};
