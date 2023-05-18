import { InferModel } from 'drizzle-orm';
import { pgTable, timestamp, varchar } from 'drizzle-orm/pg-core';

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
