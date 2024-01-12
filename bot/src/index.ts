import chalk from 'chalk';

import { createDatabase } from '@synopsis/db';
import { env } from '@synopsis/env/node';

import { Bot } from './bot';
import { getCommands } from './commands';
import { getEventHandlers } from './events';
import { getModules } from './modules';
import { BotAuthProvider } from './utils/auth-provider';

const logPrefix = chalk.bgYellow('[init]');
void (async () => {
    const commands = await getCommands();
    const events = await getEventHandlers();
    const modules = await getModules();
    console.log(
        logPrefix,
        `${commands.size} commands, ${commands.size} events, and ${commands.size} modules loaded`,
    );

    const { db } = createDatabase({
        host: env.DB_HOST,
        user: env.DB_USERNAME,
        password: env.DB_PASSWORD,
        database: env.DB_NAME,
    });
    const botUser = await db.find.authedUserByIdThrows(env.TWITCH_BOT_ID);

    const authProvider = new BotAuthProvider({
        clientId: env.TWITCH_CLIENT_ID,
        clientSecret: env.TWITCH_CLIENT_SECRET,
        db,
        ...botUser,
    });

    const botToken = await authProvider.getAccessTokenForUser(botUser.twitchId);
    if (!botToken) {
        throw new Error('could not obtain token from auth provider');
    }
    console.log(logPrefix, 'bot token loaded');

    new Bot({
        commands,
        events,
        modules,
        db,
        authProvider,
        botToken: botToken.accessToken,
    });
    console.log(logPrefix, 'bot initialized');
})();
