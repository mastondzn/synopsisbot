import type { PrivmsgMessage } from '@mastondzn/dank-twitch-irc';
import type { z } from 'zod';

import type { parseCommand } from './simplify';
import type { GlobalLevel, LocalLevel } from '~/providers';

export interface CommandBase {
    name: string;
    description: string;
    usage?: [string, string][];
    aliases?: string[];
    cooldown?: number;
    permissions?: CommandPermission[] | CommandPermission;
}

export type CommandOptions = Record<string, { schema: z.ZodType<unknown>; aliases?: string[] }>;

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
    message: PrivmsgMessage;
    parameters: NonNullable<ReturnType<typeof parseCommand>>['parameters'];
    options: Record<string, unknown>;
}

export type CommandFunction = (context: CommandContext) => CommandResult;

export type CommandPermission = { local?: LocalLevel; global?: GlobalLevel } | { mode?: 'custom' };

export type BasicCommand = CommandBase & {
    options?: CommandOptions;
    run: CommandFunction;
};

export type Subcommand = { path: string[] } & {
    options?: CommandOptions;
    run: CommandFunction;
};

export type CommandWithSubcommands = CommandBase & {
    subcommands: Subcommand[];
};

export type Command = BasicCommand | CommandWithSubcommands;
