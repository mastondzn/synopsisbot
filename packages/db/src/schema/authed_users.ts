import { InferModel } from 'drizzle-orm';
import { pgTable, timestamp, varchar } from 'drizzle-orm/pg-core';

export const authedUsers = pgTable('authed_users', {
    twitchId: varchar('twitch_id', { length: 256 }).primaryKey(),
    twitchLogin: varchar('twitch_login', { length: 256 }).notNull(),
    scopes: varchar('scopes', { length: 256 }).array().notNull(),
    accessToken: varchar('access_token', { length: 256 }).notNull(),
    refreshToken: varchar('refresh_token', { length: 256 }).notNull(),
    expiresAt: timestamp('expires_at').notNull(),
    obtainedAt: timestamp('obtained_at').notNull(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
});
export type AuthedUser = InferModel<typeof authedUsers>;
export type NewAuthedUser = InferModel<typeof authedUsers, 'insert'>;
export type UpdateAuthedUser = Partial<AuthedUser>;
