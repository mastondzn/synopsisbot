import type { InferInsertModel, InferSelectModel } from 'drizzle-orm';
import { pgTable, primaryKey, varchar } from 'drizzle-orm/pg-core';

import { defaults } from '../utils/defaults';

export const localPermissions = pgTable(
    'local_permissions',
    {
        ...defaults,

        channelId: varchar('channel_id', { length: 256 }).notNull(),
        channelLogin: varchar('channel_login', { length: 256 }).notNull(),

        userId: varchar('user_id', { length: 256 }).notNull(),
        userLogin: varchar('user_login', { length: 256 }).notNull(),

        // other permissions are determined by the incoming irc tags
        permission: varchar('permission', {
            length: 64,
            enum: ['banned', 'ambassador'],
        }).notNull(),
    },
    (table) => ({ cpk: primaryKey({ columns: [table.channelId, table.userId] }) }),
);

export type LocalPermission = InferSelectModel<typeof localPermissions>;
export type NewLocalPermission = InferInsertModel<typeof localPermissions>;
export type UpdateLocalPermission = Partial<LocalPermission>;
export type DatabaseLocalPermission = LocalPermission['permission'];

export const globalPermissions = pgTable('global_permissions', {
    ...defaults,

    userId: varchar('user_id', { length: 256 }).primaryKey(),
    userLogin: varchar('user_login', { length: 256 }).notNull(),
    permission: varchar('permission', { length: 64, enum: ['banned', 'owner'] }).notNull(),
});

export type GlobalPermission = InferSelectModel<typeof globalPermissions>;
export type NewGlobalPermission = InferInsertModel<typeof globalPermissions>;
export type UpdateGlobalPermission = Partial<GlobalPermission>;
export type DatabaseGlobalPermission = GlobalPermission['permission'];
