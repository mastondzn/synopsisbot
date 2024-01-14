import * as Sentry from '@sentry/node';
import { ProfilingIntegration } from '@sentry/profiling-node';
import { env } from '@synopsis/env/node';

import { events } from './events';
import { modules } from './modules';
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
const botToken = await authProvider.getAccessTokenForUser(botUser.twitchId);

if (!botToken) throw new Error('Bot token not found');

await chat.login({
    username: env.TWITCH_BOT_USERNAME,
    password: botToken.accessToken,
});
chat.registerEvents(events);
await chat.registerModules(modules);
