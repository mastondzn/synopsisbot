import type { Collection } from '@discordjs/collection';
import type {
    ChatClient,
    PrivmsgMessage,
    SpecificClientEvents,
    TwitchMessageEvents,
} from '@kararty/dank-twitch-irc';
import type { ApiClient } from '@twurple/api';
import type { EventSubWsListener } from '@twurple/eventsub-ws';
import type { Redis } from 'ioredis';

import type { Database } from '@synopsis/db';

import type { KnownKeys, Prettify } from './general';
import type { parseCommandParams } from '~/helpers/command';
import type { BotAuthProvider } from '~/utils/auth-provider';
import type { CommandCooldownManager } from '~/utils/cooldown';
import type { IdLoginPairProvider } from '~/utils/id-login-pair';
import type { LiveStatusManager } from '~/utils/live-manager';
import type { GlobalLevel, LocalLevel, PermissionProvider } from '~/utils/permissions';
import type { PrometheusExposer } from '~/utils/prometheus';

type SpecificClientEventsList = KnownKeys<SpecificClientEvents>;
type TwitchCommandsList = KnownKeys<TwitchMessageEvents>;

export type ChatClientEventsList = SpecificClientEventsList | TwitchCommandsList;

export type ChatClientEvents = Prettify<
    {
        [K in SpecificClientEventsList]: SpecificClientEvents[K];
    } & {
        [K in TwitchCommandsList]: TwitchMessageEvents[K];
    }
>;

export type EventHandler<T extends keyof ChatClientEvents> = (
    ...arguments_: ChatClientEvents[T]
) => Promise<void> | void;

export type BasicEventHandler = ChatClientEventsList extends infer T
    ? T extends ChatClientEventsList
        ? {
                event: T
                description?: string
                handler: EventHandler<T>
            }
        : never
    : never;

export type EventHandlerParameters<T extends ChatClientEventsList> = Parameters<EventHandler<T>>;

export interface BotContext {
    chat: ChatClient
    api: ApiClient
    db: Database
    cache: Redis
    authProvider: BotAuthProvider
    eventSub: EventSubWsListener
    commands: Collection<string, BotCommand>
    events: Collection<string, BotEventHandler>
    modules: Collection<string, BotModule>
    utils: BotUtils
}

export type BotEventHandler = ChatClientEventsList extends infer T
    ? T extends ChatClientEventsList
        ? {
                event: T
                description?: string
                handler: (
                    context: BotContext & {
                        params: EventHandlerParameters<T>
                    }
                ) => Promise<void> | void
            }
        : never
    : never;

export type BotCommandContext = BotContext & {
    msg: PrivmsgMessage
    params: ReturnType<typeof parseCommandParams>
    cancel: () => Promise<void>
};

export type CommandFragment =
    | {
        say: string
    }
    | {
        reply: string
    }
    | {
        action: string
    };

export type BotCommandResult =
    | Promise<CommandFragment | undefined>
    | CommandFragment
    | AsyncGenerator<CommandFragment>
    | Generator<CommandFragment>
    | undefined;

export type BotCommandFunction = (context: BotCommandContext) => BotCommandResult;

export interface BotSubcommand {
    path: string[]
    run: BotCommandFunction
}

export interface BotCommand {
    name: string
    description?: string
    usage?: string
    aliases?: string[]
    cooldown?: {
        user: number // seconds
        global: number // seconds
    }
    subcommands?: BotSubcommand[]
    permission?:
        | {
            local?: LocalLevel
            global?: GlobalLevel
            mode?: 'any' | 'all'
        }
        | { mode: 'custom' }
    run: BotCommandFunction
}

export interface BasicBotModule {
    name: string
    description?: string
    register: (context: BotContext) => Promise<void> | void
}

export interface BotModuleWithPriority extends BasicBotModule {
    priority: number
}

export type BotModule = BasicBotModule | BotModuleWithPriority;

export interface BotUtils {
    cooldownManager: CommandCooldownManager
    statusManager: LiveStatusManager
    prometheus: PrometheusExposer
    idLoginPairs: IdLoginPairProvider
    permissions: PermissionProvider
}
