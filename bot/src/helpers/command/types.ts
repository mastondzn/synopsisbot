import type { PrivmsgMessage } from '@kararty/dank-twitch-irc';
import type { z } from 'zod';

import type { parseParameters } from '.';
import type { GlobalLevel, LocalLevel } from '~/services/permissions';
import type { RemoveIndexSignature } from '~/types/general';

export interface CommandContext<
    TOptions extends z.ZodRawShape = z.ZodRawShape,
> {
    message: PrivmsgMessage;
    parameters: ReturnType<typeof parseParameters>;
    options: RemoveIndexSignature<z.infer<z.ZodObject<TOptions>>>;
    cancel: () => Promise<void>;
}

export type CommandFragment =
    ({ channel?: string; })
    & ({ say: string; }
    | { reply: string; }
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
