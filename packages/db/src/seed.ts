import type { Environment } from '@synopsis/env';

import { schema } from './schema';
import type { Database } from './types';

export async function seed(db: Database, environment: Environment) {
    const channels = [
        {
            mode: 'all' as const,
            twitchId: environment.TWITCH_BOT_OWNER_ID,
            twitchLogin: environment.TWITCH_BOT_OWNER_USERNAME,
        },
        {
            mode: 'all' as const,
            twitchId: environment.TWITCH_BOT_ID,
            twitchLogin: environment.TWITCH_BOT_USERNAME,
        },
    ];

    const globalPermissions = [
        {
            permission: 'owner' as const,
            userId: environment.TWITCH_BOT_OWNER_ID,
            userLogin: environment.TWITCH_BOT_OWNER_USERNAME,
        },
    ];

    await db.insert(schema.channels).values(channels).onConflictDoNothing();
    await db.insert(schema.globalPermissions).values(globalPermissions).onConflictDoNothing();
}
