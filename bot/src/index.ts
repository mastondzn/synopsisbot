import * as Sentry from '@sentry/node';
import { nodeProfilingIntegration } from '@sentry/profiling-node';
import { env } from '@synopsis/env/node';

import { commands } from './commands';
import { cronJobs } from './crons';
import { eventHandlers } from './events';
import { modules } from './modules';
import { authProvider } from './services/auth';
import { chat } from './services/chat';
import { db } from './services/database';

import './services/rpc';

Sentry.init({
    dsn: 'https://87270fc0d3264875c1071ecfec1840ce@o4506493464805376.ingest.sentry.io/4506564237983744',
    integrations: [nodeProfilingIntegration()],
    environment: env.NODE_ENV,
    tracesSampleRate: 1,
    profilesSampleRate: 1,
});

await commands.load();

const bot = await db.query.authedUsers.findFirst({
    where: ({ twitchId }, { eq }) => eq(twitchId, env.TWITCH_BOT_ID),
});

if (!bot) throw new Error('Bot not found in database');

authProvider.addUser(
    bot.twitchId,
    {
        accessToken: bot.accessToken,
        refreshToken: bot.refreshToken,
        expiresIn: bot.expiresAt.getTime() - Date.now(),
        obtainmentTimestamp: bot.obtainedAt.getTime(),
        scope: bot.scopes,
    },
    ['chat'],
);

const token = await authProvider.getAccessTokenForIntent('chat');
if (!token?.expiresIn) {
    throw new Error('Bot token not found or no expiration');
}

await chat.login({
    username: env.TWITCH_BOT_USERNAME,
    password: token.accessToken,
});

await eventHandlers.registerEvents(chat);
await modules.registerModules();
await cronJobs.start();

const line = `MrDestructoid connected and ready. (${env.NODE_ENV})`;
void chat.say(env.TWITCH_BOT_OWNER_USERNAME, line);
void chat.say(env.TWITCH_BOT_USERNAME, line);
