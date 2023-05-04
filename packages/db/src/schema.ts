import { type InferModel } from 'drizzle-orm';
import { pgTable, primaryKey, timestamp, varchar } from 'drizzle-orm/pg-core';

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

export const states = pgTable('auth_states', {
    state: varchar('state', { length: 64 }).primaryKey(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
});

export type State = InferModel<typeof states>;
export type NewState = InferModel<typeof states, 'insert'>;

export const channels = pgTable('channels', {
    twitchId: varchar('twitch_id', { length: 256 }).primaryKey(),
    twitchLogin: varchar('twitch_login', { length: 256 }).notNull(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    mode: varchar('mode', { length: 256, enum: ['readonly', 'all', 'offlineonly'] }).notNull(),
});

export type Channel = InferModel<typeof channels>;
export type NewChannel = InferModel<typeof channels, 'insert'>;
export type UpdateChannel = Partial<Channel>;
export type ChannelMode = Channel['mode'];

export const localPermissions = pgTable(
    'local_permissions',
    {
        channelId: varchar('channel_id', { length: 256 }).references(() => channels.twitchId, {
            onDelete: 'cascade',
        }),
        channelLogin: varchar('channel_login', { length: 256 }).notNull(),

        userId: varchar('user_id', { length: 256 }).notNull(),
        userLogin: varchar('user_login', { length: 256 }).notNull(),

        // other permissions are determined by the incoming irc tags
        permission: varchar('permission', {
            length: 64,
            enum: ['banned', 'ambassador'],
        }).notNull(),
    },
    (table) => ({ cpk: primaryKey(table.channelId, table.userId) })
);
export type LocalPermission = InferModel<typeof localPermissions>;
export type NewLocalPermission = InferModel<typeof localPermissions, 'insert'>;
export type UpdateLocalPermission = Partial<LocalPermission>;
export type DatabaseLocalPermission = LocalPermission['permission'];

export const globalPermissions = pgTable('global_permissions', {
    userId: varchar('user_id', { length: 256 }).primaryKey(),
    userLogin: varchar('user_login', { length: 256 }).notNull(),
    permission: varchar('permission', { length: 64, enum: ['banned', 'owner'] }).notNull(),
});
export type GlobalPermission = InferModel<typeof globalPermissions>;
export type NewGlobalPermission = InferModel<typeof globalPermissions, 'insert'>;
export type UpdateGlobalPermission = Partial<GlobalPermission>;
export type DatabaseGlobalPermission = GlobalPermission['permission'];
