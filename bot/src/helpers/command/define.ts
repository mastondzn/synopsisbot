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
    const TOptions extends ZodOptions = ZodOptions,
    const TArguments extends ZodArguments = ZodArguments,
>(
    command: Omit<BasicCommand, 'run' | 'options' | 'arguments'> & {
        options?: TOptions;
        arguments?: TArguments;
        run: (
            context: Omit<CommandContext, 'options' | 'arguments'> & {
                options: { [K in keyof TOptions]: z.infer<TOptions[K]['schema']> };
                arguments: TArguments extends [z.ZodType<unknown>, ...z.ZodType<unknown>[]]
                    ? z.infer<z.ZodTuple<TArguments, z.ZodType<string>>>
                    : string[];
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
    const TOptions extends ZodOptions = ZodOptions,
    const TArguments extends ZodArguments = ZodArguments,
>(
    subcommand: Omit<Subcommand, 'run' | 'options' | 'arguments'> & {
        options?: TOptions;
        run: (
            context: Omit<CommandContext, 'options' | 'arguments'> & {
                options: { [K in keyof TOptions]: z.infer<TOptions[K]['schema']> };
                arguments: TArguments extends [z.ZodType<unknown>, ...z.ZodType<unknown>[]]
                    ? z.infer<z.ZodTuple<TArguments, z.ZodType<string>>>
                    : string[];
            },
        ) => CommandResult;
    },
): Subcommand;

export function createSubcommand<
    const TOptions extends ZodOptions = ZodOptions,
    const TArguments extends ZodArguments = ZodArguments,
>(
    subcommand: Omit<SubcommandWithPermission, 'run' | 'options' | 'arguments'> & {
        options?: TOptions;
        run: (
            context: Omit<CommandContext, 'options' | 'arguments'> & {
                options: { [K in keyof TOptions]: z.infer<TOptions[K]['schema']> };
                arguments: TArguments extends [z.ZodType<unknown>, ...z.ZodType<unknown>[]]
                    ? z.infer<z.ZodTuple<TArguments, z.ZodType<string>>>
                    : string[];
            },
        ) => CommandResult;
    },
): SubcommandWithPermission;

export function createSubcommand(subcommand: Subcommand | SubcommandWithPermission) {
    return subcommand;
}
