import type { InferInsertModel, InferSelectModel } from 'drizzle-orm';

import { columns, table } from '../utils';

export const channels = table('channels', {
    twitchId: columns.varchar('twitch_id', { length: 256 }).primaryKey(),
    twitchLogin: columns.varchar('twitch_login', { length: 256 }).notNull(),
    mode: columns
        .varchar('mode', {
            length: 256,
            enum: ['readonly', 'all', 'offlineonly', 'liveonly'],
        })
        .notNull(),
});

export type Channel = InferSelectModel<typeof channels>;
export type NewChannel = InferInsertModel<typeof channels>;
export type UpdateChannel = Partial<Channel>;
export type ChannelMode = Channel['mode'];
