export type SomeFunction = (...arguments_: never[]) => unknown;

export type SomeAsyncFunction = (...arguments_: never[]) => Promise<unknown>;

export type Resolvable<T> = T | (() => T) | Promise<T> | (() => Promise<T>);

export type Prettify<T> = {
    [K in keyof T]: T[K];
};

export type KnownKeys<T> = keyof {
    [K in keyof T as string extends K ? never : number extends K ? never : K]: never;
};
