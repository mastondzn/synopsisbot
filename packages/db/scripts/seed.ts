import { env } from '@synopsis/env/node';

import { channels, createDatabase, globalPermissions } from '~/index';

async function main() {
    const db = createDatabase({
        host: 'localhost',
        user: env.DB_USERNAME,
        password: env.DB_PASSWORD,
        database: env.DB_NAME,
        logger: true,
        max: 1,
    });

    await db
        .insert(channels)
        .values([{
            mode: 'all',
            twitchId: env.TWITCH_BOT_OWNER_ID,
            twitchLogin: env.TWITCH_BOT_OWNER_USERNAME,
        }, {
            mode: 'all',
            twitchId: env.TWITCH_BOT_ID,
            twitchLogin: env.TWITCH_BOT_USERNAME,
        }])
        .onConflictDoNothing();

    await db
        .insert(globalPermissions)
        .values([{
            permission: 'owner',
            userId: env.TWITCH_BOT_OWNER_ID,
            userLogin: env.TWITCH_BOT_OWNER_USERNAME,
        }])
        .onConflictDoNothing();

    console.log('Seeding complete!');
    await db.raw.end();
}

void main();
