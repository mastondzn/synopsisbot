import { type InferModel } from 'drizzle-orm';
import { integer, pgTable, varchar } from 'drizzle-orm/pg-core';

export const commands = pgTable('commands', {
    name: varchar('name', { length: 64 }).notNull().primaryKey(),
    description: varchar('description', { length: 512 }),
    aliases: varchar('aliases', { length: 64 }).array(),
    usage: varchar('usage', { length: 4096 }),

    userCooldown: integer('user_cooldown').default(10).notNull(),
    globalCooldown: integer('global_cooldown').default(10).notNull(),

    localPermission: varchar('permission', {
        length: 64,
        enum: ['broadcaster', 'ambassador', 'moderator', 'vip', 'normal', 'banned'],
    })
        .default('normal')
        .notNull(),

    globalPermission: varchar('global_permission', {
        length: 64,
        enum: ['owner', 'normal', 'banned'],
    })
        .default('normal')
        .notNull(),

    permissionMode: varchar('permission_mode', {
        length: 64,
        enum: ['any', 'all', 'custom'],
    })
        .default('all')
        .notNull(),
});
export type Command = InferModel<typeof commands>;
export type NewCommand = InferModel<typeof commands, 'insert'>;
export type UpdateCommand = Partial<Command>;
