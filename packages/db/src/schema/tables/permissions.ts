import type { InferInsertModel, InferSelectModel } from 'drizzle-orm';
import { primaryKey } from 'drizzle-orm/pg-core';

import { columns, table } from '../utils';

export const localPermissions = table(
    'local_permissions',
    {
        channelId: columns.varchar('channel_id', { length: 256 }).notNull(),
        channelLogin: columns.varchar('channel_login', { length: 256 }).notNull(),

        userId: columns.varchar('user_id', { length: 256 }).notNull(),
        userLogin: columns.varchar('user_login', { length: 256 }).notNull(),

        // other permissions are determined by the incoming irc tags
        permission: columns
            .varchar('permission', { length: 64, enum: ['banned', 'ambassador'] })
            .notNull(),
    },
    (table) => ({ cpk: primaryKey({ columns: [table.channelId, table.userId] }) }),
);

export type LocalPermission = InferSelectModel<typeof localPermissions>;
export type NewLocalPermission = InferInsertModel<typeof localPermissions>;
export type UpdateLocalPermission = Partial<LocalPermission>;
export type DatabaseLocalPermission = LocalPermission['permission'];

export const globalPermissions = table('global_permissions', {
    userId: columns.varchar('user_id', { length: 256 }).primaryKey(),
    userLogin: columns.varchar('user_login', { length: 256 }).notNull(),
    permission: columns.varchar('permission', { length: 64, enum: ['banned', 'owner'] }).notNull(),
});

export type GlobalPermission = InferSelectModel<typeof globalPermissions>;
export type NewGlobalPermission = InferInsertModel<typeof globalPermissions>;
export type UpdateGlobalPermission = Partial<GlobalPermission>;
export type DatabaseGlobalPermission = GlobalPermission['permission'];
