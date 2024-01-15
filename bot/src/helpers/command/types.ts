import type { PrivmsgMessage } from '@kararty/dank-twitch-irc';
import type { z } from 'zod';

import type { parseCommand } from './simplify';
import type { GlobalLevel, LocalLevel } from '~/services/permissions';
import type { RemoveIndexSignature } from '~/types/general';

export interface CommandContext<
    TOptions extends z.ZodRawShape = z.ZodRawShape,
> {
    message: PrivmsgMessage;
    parameters: NonNullable<ReturnType<typeof parseCommand>>['parameters'];
    options: RemoveIndexSignature<z.infer<z.ZodObject<TOptions>>>;
    cancel: () => Promise<void>;
}

export type CommandFragment =
    ({ channel?: string; })
    & ({ say: string; }
    | {
        reply: string;
        to?: Pick<PrivmsgMessage, 'messageID'>;
    }
    | { action: string; });

export type CommandResult =
    | AsyncGenerator<CommandFragment>
    | Generator<CommandFragment>
    | Promise<CommandFragment>
    | CommandFragment
    // side effect/cancelled command
    | Promise<void>
    // eslint-disable-next-line ts/no-invalid-void-type
    | void;

export type CommandFunction<TOptions extends z.ZodRawShape>
    = (context: CommandContext<TOptions>) => CommandResult;

export interface CommandPermissions {
    local?: LocalLevel;
    global?: GlobalLevel;
    mode?: 'any' | 'all' | 'custom';
}

export interface Subcommand<TOptions extends z.ZodRawShape> {
    path: string[];
    options?: TOptions;
    permissions?: CommandPermissions;
    run: CommandFunction<TOptions>;
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

export type BasicCommand<
    TOptions extends z.ZodRawShape = z.ZodRawShape,
> = BaseCommand & {
    options?: TOptions;
    permissions?: CommandPermissions;
    run: CommandFunction<TOptions>;
};

export type CommandWithSubcommands<TOptions extends z.ZodRawShape> = BaseCommand & {
    subcommands: Subcommand<TOptions>[];
};

export type Command<
    TOptions extends z.ZodRawShape = z.ZodRawShape,
> = BasicCommand<TOptions> | CommandWithSubcommands<TOptions>;
