import { Bot } from './bot';
import { getCommands } from './commands';
import { getEventHandlers } from './events';
import { getModules } from './modules';

void (async () => {
    const commands = await getCommands();
    const events = await getEventHandlers();
    const modules = await getModules();

    const bot = new Bot({
        commands,
        events,
        modules,
    });

    await bot.initialize();
})();
