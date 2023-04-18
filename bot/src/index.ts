import { Bot } from './bot';
import { getCommands } from './commands';
import { getEventHandlers } from './events';

void (async () => {
    const commands = await getCommands();
    const events = await getEventHandlers();

    const bot = new Bot({
        commands,
        events,
    });

    await bot.initialize();
})();
