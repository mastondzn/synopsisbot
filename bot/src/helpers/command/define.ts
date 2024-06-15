import type { z } from 'zod';

import type {
    BasicCommand,
    Command,
    CommandContext,
    CommandOptions,
    CommandResult,
    CommandWithSubcommands,
    Subcommand,
    SubcommandWithPermission,
} from './types';

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

export function createCommand(command: BasicCommand): Command {
    return command;
}

export function createCommandWithSubcommands(command: CommandWithSubcommands): Command {
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
): Subcommand;

export function createSubcommand<T extends CommandOptions = CommandOptions>(
    subcommand: Omit<SubcommandWithPermission, 'run' | 'options'> & {
        options?: T;
        run: (
            context: Omit<CommandContext, 'options'> & {
                options: { [K in keyof T]: z.infer<T[K]['schema']> };
            },
        ) => CommandResult;
    },
): SubcommandWithPermission;

export function createSubcommand(subcommand: Subcommand | SubcommandWithPermission) {
    return subcommand;
}
