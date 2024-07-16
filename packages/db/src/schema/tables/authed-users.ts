import type { InferInsertModel, InferSelectModel } from 'drizzle-orm';

import { columns, table } from '../utils';

export const authedUsers = table('authed_users', {
    twitchId: columns.varchar('twitch_id', { length: 256 }).primaryKey(),
    twitchLogin: columns.varchar('twitch_login', { length: 256 }).notNull(),
    scopes: columns.varchar('scopes', { length: 256 }).array().notNull(),
    accessToken: columns.varchar('access_token', { length: 256 }).notNull(),
    refreshToken: columns.varchar('refresh_token', { length: 256 }).notNull(),
    expiresAt: columns.timestamp('expires_at').notNull(),
    obtainedAt: columns.timestamp('obtained_at').notNull(),
});

export type AuthedUser = InferSelectModel<typeof authedUsers>;
export type NewAuthedUser = InferInsertModel<typeof authedUsers>;
export type UpdateAuthedUser = Partial<AuthedUser>;
