import type { PrivmsgMessage } from '@kararty/dank-twitch-irc';

import type { parseCommand } from './simplify';
import type { GlobalLevel, LocalLevel } from '~/providers';

export interface CommandContext {
    message: PrivmsgMessage;
    parameters: NonNullable<ReturnType<typeof parseCommand>>['parameters'];
}

export type CommandFragment = (
    | { say: string }
    | { action: string }
    | {
          reply: string;
          to?: Pick<PrivmsgMessage, 'messageID'>;
      }
) & { channel?: string };

export type CommandResult =
    | AsyncGenerator<CommandFragment>
    | Generator<CommandFragment>
    | Promise<CommandFragment>
    | CommandFragment;

export type CommandFunction = (context: CommandContext) => CommandResult;

export type CommandPermission =
    | {
          local?: LocalLevel;
          global?: GlobalLevel;
      }
    | { mode?: 'custom' };

export interface Subcommand {
    path: string[];
    permissions?: CommandPermission[] | CommandPermission;
    run: CommandFunction;
}

type CommandUsage = [string, string][];

export interface BaseCommand {
    name: string;
    description?: string;
    usage?: CommandUsage;
    aliases?: string[];
    cooldown?: number;
}

export type BasicCommand = BaseCommand & {
    permissions?: CommandPermission[] | CommandPermission;
    run: CommandFunction;
};

export type CommandWithSubcommands = BaseCommand & {
    subcommands: Subcommand[];
};

export type Command = BasicCommand | CommandWithSubcommands;
