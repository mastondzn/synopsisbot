import type { InferInsertModel, InferSelectModel } from 'drizzle-orm';
import { pgTable, timestamp, varchar } from 'drizzle-orm/pg-core';

import { defaults } from '../utils/defaults';

export const authedUsers = pgTable('authed_users', {
    ...defaults,

    twitchId: varchar('twitch_id', { length: 256 }).primaryKey(),
    twitchLogin: varchar('twitch_login', { length: 256 }).notNull(),
    scopes: varchar('scopes', { length: 256 }).array().notNull(),
    accessToken: varchar('access_token', { length: 256 }).notNull(),
    refreshToken: varchar('refresh_token', { length: 256 }).notNull(),
    expiresAt: timestamp('expires_at').notNull(),
    obtainedAt: timestamp('obtained_at').notNull(),
});

export type AuthedUser = InferSelectModel<typeof authedUsers>;
export type NewAuthedUser = InferInsertModel<typeof authedUsers>;
export type UpdateAuthedUser = Partial<AuthedUser>;
