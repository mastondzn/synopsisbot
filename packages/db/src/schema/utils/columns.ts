import * as pgColumns from 'drizzle-orm/pg-core/columns';

export const columns = pgColumns as {
    [Key in keyof typeof pgColumns as Key extends Uncapitalize<Key>
        ? Key
        : never]: (typeof pgColumns)[Key];
};
