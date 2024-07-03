import { createCommand, createSubcommand } from './command/define';
import { createCron } from './cron/define';
import { createEventListener } from './event';
import { createModule } from './module/define';

export const create = {
    command: createCommand,
    subcommand: createSubcommand,
    module: createModule,
    cron: createCron,
    listener: createEventListener,
};
