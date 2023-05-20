import type * as schema from './schema';

type Prettify<T> = {
    [K in keyof T]: T[K];
};

export type DatabaseSchema = Prettify<typeof schema>;
export * from './schema';
export * as schema from './schema';
