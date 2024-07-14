import type { InferInsertModel, InferSelectModel } from 'drizzle-orm';
import { pgTable, varchar } from 'drizzle-orm/pg-core';

import { defaults } from '../utils/defaults';

export const commandUsers = pgTable('command_users', {
    twitchId: varchar('twitch_id', { length: 256 }).primaryKey(),
    twitchLogin: varchar('twitch_login', { length: 256 }).notNull(),
    ...defaults(),
});

export type CommandUser = InferSelectModel<typeof commandUsers>;
export type NewCommandUser = InferInsertModel<typeof commandUsers>;
export type UpdateCommandUser = Partial<CommandUser>;
