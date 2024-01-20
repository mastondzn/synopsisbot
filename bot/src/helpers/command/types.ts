import type { PrivmsgMessage } from '@kararty/dank-twitch-irc';

import type { parseCommand } from './simplify';
import type { GlobalLevel, LocalLevel } from '~/providers';

export interface CommandContext {
    message: PrivmsgMessage;
    parameters: NonNullable<ReturnType<typeof parseCommand>>['parameters'];
    cancel: () => Promise<void>;
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
    | CommandFragment
    // side effect/cancelled command
    | Promise<void>
    // eslint-disable-next-line ts/no-invalid-void-type
    | void;

export type CommandFunction = (context: CommandContext) => CommandResult;

export interface CommandPermissions {
    local?: LocalLevel;
    global?: GlobalLevel;
    mode?: 'any' | 'all' | 'custom';
}

export interface Subcommand {
    path: string[];
    permissions?: CommandPermissions;
    run: CommandFunction;
}

export interface BaseCommand {
    name: string;
    description?: string;
    usage?: string;
    aliases?: string[];
    cooldown?: {
        user?: number; // seconds
        global?: number; // seconds
    };
}

export type BasicCommand = BaseCommand & {
    permissions?: CommandPermissions;
    run: CommandFunction;
};

export type CommandWithSubcommands = BaseCommand & {
    subcommands: Subcommand[];
};

export type Command = BasicCommand | CommandWithSubcommands;
