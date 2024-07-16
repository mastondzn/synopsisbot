import type { InferInsertModel, InferSelectModel } from 'drizzle-orm';
import { varchar } from 'drizzle-orm/pg-core';

import { table } from '../utils';

export const commandUsers = table('command_users', {
    twitchId: varchar('twitch_id', { length: 256 }).primaryKey(),
    twitchLogin: varchar('twitch_login', { length: 256 }).notNull(),
});

export type CommandUser = InferSelectModel<typeof commandUsers>;
export type NewCommandUser = InferInsertModel<typeof commandUsers>;
export type UpdateCommandUser = Partial<CommandUser>;
