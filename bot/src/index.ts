import { env } from '@synopsis/env/node';

import { getEventHandlers } from './events';
import { getModules } from './modules';
import { authProvider } from './services/auth';
import { chat } from './services/chat';
import { db } from './services/database';

const botUser = await db.find.authedUserByIdThrows(env.TWITCH_BOT_ID);

authProvider.addUser(botUser.twitchId, {
    accessToken: botUser.accessToken,
    refreshToken: botUser.refreshToken,
    expiresIn: botUser.expiresAt.getTime() - Date.now(),
    obtainmentTimestamp: botUser.obtainedAt.getTime(),
    scope: botUser.scopes,
});

const botToken = await authProvider.getAccessTokenForUser(botUser.twitchId);
if (!botToken) throw new Error('Bot token not found');

await chat.login({
    username: env.TWITCH_BOT_USERNAME,
    password: botToken.accessToken,
});

const events = await getEventHandlers();
const modules = await getModules();

await chat.registerModules(modules);
chat.registerEvents(events);
