import type { PrivmsgMessage } from '@mastondzn/dank-twitch-irc';
import type { z } from 'zod';

import type { CommandParameters } from './parameters';
import type { GlobalLevel, LocalLevel } from '~/providers/permissions';

export interface CommandBase {
    name: string;
    description: string;
    usage?: [string, string][];
    aliases?: string[];
    cooldown?: number;
    permissions?: CommandPermission;
}

export type ZodOptions = Record<string, { schema: z.ZodType<unknown>; aliases?: string[] }>;

export type ZodArgumentTuple = z.ZodTuple<
    [z.ZodType<unknown>, ...z.ZodType<unknown>[]] | [],
    // The rest of the arguments
    null | z.ZodType<unknown>
>;
export type ZodArgumentUnion = z.ZodUnion<[ZodArgumentTuple, ...ZodArgumentTuple[]]>;
export type ZodArgumentArray = z.ZodArray<z.ZodType<unknown>, z.ArrayCardinality>;
export type ZodArguments = ZodArgumentTuple | ZodArgumentUnion | ZodArgumentArray;

export type CommandFragment = (
    | { say: string }
    | { action: string }
    | { reply: string; to?: Pick<PrivmsgMessage, 'messageID'> }
) & { channel?: string };

export type CommandResult =
    | AsyncGenerator<CommandFragment>
    | Generator<CommandFragment>
    | Promise<CommandFragment>
    | CommandFragment;

export interface CommandContext {
    /** @deprecated please don't use this as it will probably be unstable after eventsub */
    message: PrivmsgMessage;
    parameters: CommandParameters;
    user: { id: string; login: string; displayName: string };
    channel: { id: string; login: string };
    options: Record<string, unknown>;
    args: unknown[];
}

export type CommandFunction = (context: CommandContext) => CommandResult;

export type CommandPermission = { local?: LocalLevel; global?: GlobalLevel } | 'custom';

export type BasicCommand = CommandBase & {
    options?: ZodOptions;
    arguments?: ZodArguments;
    run: CommandFunction;
};

export interface Subcommand {
    path?: string[];
    options?: ZodOptions;
    arguments?: ZodArguments;
    run: CommandFunction;
}

export type SubcommandWithPermission = Subcommand & { permissions: CommandPermission };

export type CommandWithSubcommands =
    | (CommandBase & { subcommands: Subcommand[] })
    | (Omit<CommandBase, 'permissions'> & { subcommands: SubcommandWithPermission[] });

export type Command = BasicCommand | CommandWithSubcommands;
