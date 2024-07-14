import { timestamp } from 'drizzle-orm/pg-core';

// this is a function because i don't know if perhaps theres some metadata that gets edited within?
export function defaults() {
    return {
        createdAt: timestamp('created_at').notNull().defaultNow(),
        updatedAt: timestamp('updated_at').notNull().defaultNow(),
    };
}
