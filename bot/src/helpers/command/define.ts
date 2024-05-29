import type { z } from 'zod';

import type {
    BasicCommand,
    CommandContext,
    CommandOptions,
    CommandResult,
    CommandWithSubcommands,
    Subcommand,
} from './types';

export function createCommand(command: CommandWithSubcommands): CommandWithSubcommands;
export function createCommand<T extends CommandOptions = CommandOptions>(
    command: Omit<BasicCommand, 'run' | 'options'> & {
        options?: T;
        run: (
            context: Omit<CommandContext, 'options'> & {
                options: { [K in keyof T]: z.infer<T[K]['schema']> };
            },
        ) => CommandResult;
    },
): BasicCommand;
export function createCommand(command: BasicCommand | CommandWithSubcommands) {
    return command;
}

export function createSubcommand<T extends CommandOptions = CommandOptions>(
    subcommand: Omit<Subcommand, 'run' | 'options'> & {
        options?: T;
        run: (
            context: Omit<CommandContext, 'options'> & {
                options: { [K in keyof T]: z.infer<T[K]['schema']> };
            },
        ) => CommandResult;
    },
) {
    return subcommand;
}
