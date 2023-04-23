import chalk from 'chalk';

import { Bot } from './bot';
import { getCommands } from './commands';
import { getEventHandlers } from './events';
import { getModules } from './modules';

const logPrefix = chalk.bgYellow('[init]');
void (async () => {
    const commands = await getCommands();
    console.log(`${logPrefix} ${commands.size} commands files loaded`);
    const events = await getEventHandlers();
    console.log(`${logPrefix} ${events.size} events files loaded`);
    const modules = await getModules();
    console.log(`${logPrefix} ${modules.size} module files loaded`);

    const bot = new Bot({ commands, events, modules });
    await bot.initialize();
    console.log(`${logPrefix} bot initialized`);
})();
