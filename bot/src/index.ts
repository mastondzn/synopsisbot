import chalk from 'chalk';

import { getAuthedUserByIdThrows, makeDatabase } from '@synopsis/db';
import { env } from '@synopsis/env/node';

import { Bot } from './bot';
import { getCommands } from './commands';
import { getEventHandlers } from './events';
import { getModules } from './modules';

const logPrefix = chalk.bgYellow('[init]');
void (async () => {
    const commands = await getCommands();
    console.log(logPrefix, `${commands.size} commands files loaded`);
    const events = await getEventHandlers();
    console.log(logPrefix, `${events.size} events files loaded`);
    const modules = await getModules();
    console.log(logPrefix, `${modules.size} module files loaded`);

    const { db, pool } = makeDatabase({
        host: env.DB_HOST,
        user: env.DB_USERNAME,
        password: env.DB_PASSWORD,
        database: env.DB_NAME,
    });
    console.log(logPrefix, `database connection created`);

    const botUser = await getAuthedUserByIdThrows(db, env.TWITCH_BOT_ID);
    console.log(logPrefix, `bot user loaded`);

    new Bot({ commands, events, modules, db, pool, botUser });
    console.log(logPrefix, `bot initialized`);
})();
