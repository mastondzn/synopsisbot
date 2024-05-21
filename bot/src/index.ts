import * as Sentry from '@sentry/node';
import { nodeProfilingIntegration } from '@sentry/profiling-node';
import { env } from '@synopsis/env/node';

import { cronJobs } from './crons';
import { eventHandlers } from './events';
import { modules } from './modules';
import { authProvider, chat, db } from './services';

Sentry.init({
    dsn: 'https://87270fc0d3264875c1071ecfec1840ce@o4506493464805376.ingest.sentry.io/4506564237983744',
    integrations: [nodeProfilingIntegration()],
    environment: env.NODE_ENV,
    tracesSampleRate: 1,
    profilesSampleRate: 1,
});

const botUser = await db.find.authedUserByIdThrows(env.TWITCH_BOT_ID);
authProvider.addUser(
    botUser.twitchId,
    {
        accessToken: botUser.accessToken,
        refreshToken: botUser.refreshToken,
        expiresIn: botUser.expiresAt.getTime() - Date.now(),
        obtainmentTimestamp: botUser.obtainedAt.getTime(),
        scope: botUser.scopes,
    },
    ['chat'],
);

const botToken = await authProvider.getAccessTokenForIntent('chat');
if (!botToken?.expiresIn) {
    throw new Error('Bot token not found or no expiration');
}

await chat.login({
    username: env.TWITCH_BOT_USERNAME,
    password: botToken.accessToken,
});

await eventHandlers.registerEvents(chat);
await modules.registerModules();
await cronJobs.start();

const line = `MrDestructoid connected and ready. (${env.NODE_ENV})`;
void chat.say(env.TWITCH_BOT_OWNER_USERNAME, line);
void chat.say(env.TWITCH_BOT_USERNAME, line);
