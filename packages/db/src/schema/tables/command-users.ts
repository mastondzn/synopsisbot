import type { InferModel } from 'drizzle-orm';
import { integer, pgTable, timestamp, varchar } from 'drizzle-orm/pg-core';

export const commandUsers = pgTable('command_users', {
    twitchId: varchar('twitch_id', { length: 256 }).primaryKey(),
    twitchLogin: varchar('twitch_login', { length: 256 }).notNull(),
    createdAt: timestamp('created_at').notNull().defaultNow(),

    hydrationPoints: integer('hydration_points').notNull().default(0),
    hydratedAt: timestamp('hydrated_at'),
});
export type CommandUser = InferModel<typeof commandUsers>;
export type NewCommandUser = InferModel<typeof commandUsers, 'insert'>;
export type UpdateCommandUser = Partial<CommandUser>;
