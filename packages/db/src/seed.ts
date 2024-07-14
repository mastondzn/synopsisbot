import type { Environment } from '@synopsis/env';

import { type NewChannel, type NewGlobalPermission, schema } from './schema';
import type { Database } from './types';

// eslint-disable-next-line unicorn/prevent-abbreviations
export async function seed(db: Database, env: Environment) {
    const channels: NewChannel[] = [
        {
            mode: 'all' as const,
            twitchId: env.TWITCH_BOT_OWNER_ID,
            twitchLogin: env.TWITCH_BOT_OWNER_USERNAME,
        },
        {
            mode: 'all' as const,
            twitchId: env.TWITCH_BOT_ID,
            twitchLogin: env.TWITCH_BOT_USERNAME,
        },
    ];

    const globalPermissions: NewGlobalPermission[] = [
        {
            permission: 'owner',
            userId: env.TWITCH_BOT_OWNER_ID,
            userLogin: env.TWITCH_BOT_OWNER_USERNAME,
        },
    ];

    await db.insert(schema.channels).values(channels).onConflictDoNothing();
    await db.insert(schema.globalPermissions).values(globalPermissions).onConflictDoNothing();
}
