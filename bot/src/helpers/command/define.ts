import type { z } from 'zod';

import type {
    BasicCommand,
    Command,
    CommandContext,
    CommandResult,
    CommandWithSubcommands,
    Subcommand,
    SubcommandWithPermission,
    ZodArguments,
    ZodOptions,
} from './types';

export function createCommand<
    const TOptions extends ZodOptions = Record<never, never>,
    const TArguments extends ZodArguments = z.ZodTuple<[]>,
>(
    command: Omit<BasicCommand, 'run' | 'options' | 'arguments'> & {
        options?: TOptions;
        arguments?: TArguments;
        run: (
            context: Omit<CommandContext, 'options' | 'args'> & {
                options: { [K in keyof TOptions]: z.infer<TOptions[K]['schema']> };
                args: z.infer<TArguments>;
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

export function createSubcommand<
    const TOptions extends ZodOptions = Record<never, never>,
    const TArguments extends ZodArguments = z.ZodTuple<[]>,
>(
    subcommand: Omit<Subcommand, 'run' | 'options' | 'arguments'> & {
        options?: TOptions;
        arguments?: TArguments;
        run: (
            context: Omit<CommandContext, 'options' | 'args'> & {
                options: { [K in keyof TOptions]: z.infer<TOptions[K]['schema']> };
                args: z.infer<TArguments>;
            },
        ) => CommandResult;
    },
): Subcommand;

export function createSubcommand<
    const TOptions extends ZodOptions = Record<never, never>,
    const TArguments extends ZodArguments = z.ZodTuple<[]>,
>(
    subcommand: Omit<SubcommandWithPermission, 'run' | 'options' | 'arguments'> & {
        options?: TOptions;
        arguments?: TArguments;
        run: (
            context: Omit<CommandContext, 'options' | 'args'> & {
                options: { [K in keyof TOptions]: z.infer<TOptions[K]['schema']> };
                args: z.infer<TArguments>;
            },
        ) => CommandResult;
    },
): SubcommandWithPermission;

export function createSubcommand(
    subcommand: Subcommand | SubcommandWithPermission,
): SubcommandWithPermission | Subcommand {
    return subcommand;
}
