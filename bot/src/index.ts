import * as Sentry from '@sentry/node';
import { ProfilingIntegration } from '@sentry/profiling-node';
import { env } from '@synopsis/env/node';

import { getEventHandlers } from './events';
import { getModules } from './modules';
import { authProvider } from './services/auth';
import { chat } from './services/chat';
import { db } from './services/database';

Sentry.init({
    dsn: 'https://87270fc0d3264875c1071ecfec1840ce@o4506493464805376.ingest.sentry.io/4506564237983744',
    integrations: [new ProfilingIntegration()],
    environment: env.NODE_ENV,
    tracesSampleRate: 1,
    profilesSampleRate: 1,
});

let line = `MrDestructoid connected and ready.`;
if (env.NODE_ENV === 'development') line = `${line} (development)`;

const events = await getEventHandlers();
const modules = await getModules();

const botUser = await db.find.authedUserByIdThrows(env.TWITCH_BOT_ID);
authProvider.addUser(botUser.twitchId, {
    accessToken: botUser.accessToken,
    refreshToken: botUser.refreshToken,
    expiresIn: botUser.expiresAt.getTime() - Date.now(),
    obtainmentTimestamp: botUser.obtainedAt.getTime(),
    scope: botUser.scopes,
}, ['chat']);

const botToken = await authProvider.getAccessTokenForUser(botUser.twitchId);
if (!botToken?.expiresIn) {
    throw new Error('Bot token not found or no expiration');
};
setTimeout(() => {
    void authProvider.refreshAccessTokenForIntent('chat');
}, (botToken.expiresIn * 1000) - 1000 * 60 * 60);

chat.registerEvents(events);
await chat.login({
    username: env.TWITCH_BOT_USERNAME,
    password: botToken.accessToken,
});

await chat.registerModules(modules);
void chat.say(env.TWITCH_BOT_OWNER_USERNAME, line);
void chat.say(env.TWITCH_BOT_USERNAME, line);
