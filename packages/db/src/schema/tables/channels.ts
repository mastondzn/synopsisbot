import type { InferInsertModel, InferSelectModel } from 'drizzle-orm';
import { pgTable, varchar } from 'drizzle-orm/pg-core';

import { defaults } from '../utils/defaults';

export const channels = pgTable('channels', {
    twitchId: varchar('twitch_id', { length: 256 }).primaryKey(),
    twitchLogin: varchar('twitch_login', { length: 256 }).notNull(),
    mode: varchar('mode', {
        length: 256,
        enum: ['readonly', 'all', 'offlineonly', 'liveonly'],
    }).notNull(),
    ...defaults(),
});

export type Channel = InferSelectModel<typeof channels>;
export type NewChannel = InferInsertModel<typeof channels>;
export type UpdateChannel = Partial<Channel>;
export type ChannelMode = Channel['mode'];
