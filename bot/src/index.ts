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

let line = `MrDestructoid connected and ready.`;
if (env.NODE_ENV === 'development') line = `${line} (development)`;

void chat.say(env.TWITCH_BOT_OWNER_USERNAME, line);
void chat.say(env.TWITCH_BOT_USERNAME, line);
