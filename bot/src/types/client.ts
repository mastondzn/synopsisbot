import { type Collection } from '@discordjs/collection';
import {
    type ChatClient,
    type PrivmsgMessage,
    type SpecificClientEvents,
    type TwitchMessageEvents,
} from '@kararty/dank-twitch-irc';
import { type ApiClient } from '@twurple/api';
import { type EventSubWsListener } from '@twurple/eventsub-ws';
import { type Redis } from 'ioredis';

import { type NodePgDatabase } from '@synopsis/db';

import { type KnownKeys, type Prettify } from './general';
import { type BotAuthProvider } from '~/utils/auth-provider';
import { type parseCommandParams } from '~/helpers/command';
import { type CommandCooldownManager } from '~/utils/cooldown';
import { type IdLoginPairProvider } from '~/utils/id-login-pair';
import { type LiveStatusManager } from '~/utils/live-manager';
import { type GlobalLevel, type LocalLevel, type PermissionProvider } from '~/utils/permissions';
import { type PrometheusExposer } from '~/utils/prometheus';

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
    ...args: ChatClientEvents[T]
) => Promise<void> | void;

export type BasicEventHandler = ChatClientEventsList extends infer T
    ? T extends ChatClientEventsList
        ? {
              event: T;
              description?: string;
              handler: EventHandler<T>;
          }
        : never
    : never;

export type EventHandlerParams<T extends ChatClientEventsList> = Parameters<EventHandler<T>>;

export interface BotContext {
    chat: ChatClient;
    api: ApiClient;
    db: NodePgDatabase;
    cache: Redis;
    authProvider: BotAuthProvider;
    eventSub: EventSubWsListener;
    commands: Collection<string, BotCommand>;
    events: Collection<string, BotEventHandler>;
    modules: Collection<string, BotModule>;
    utils: BotUtils;
}

export type BotEventHandler = ChatClientEventsList extends infer T
    ? T extends ChatClientEventsList
        ? {
              event: T;
              description?: string;
              handler: (
                  ctx: BotContext & {
                      params: EventHandlerParams<T>;
                  }
              ) => Promise<void> | void;
          }
        : never
    : never;

export type BotCommandContext = BotContext & {
    msg: PrivmsgMessage;
    params: ReturnType<typeof parseCommandParams>;
    reply: (text: string) => Promise<void>;
    say: (text: string) => Promise<void>;
    cancel: () => Promise<void>;
};

export interface BotCommand {
    name: string;
    description?: string;
    usage?: string;
    aliases?: string[];
    cooldown?: {
        user: number; // seconds
        global: number; // seconds
    };
    permission?:
        | {
              local?: LocalLevel;
              global?: GlobalLevel;
              mode?: 'any' | 'all';
          }
        | { mode: 'custom' };
    run: (ctx: BotCommandContext) => Promise<void> | void;
}

export interface BasicBotModule {
    name: string;
    description?: string;
    register: (ctx: BotContext) => Promise<void> | void;
}

export interface BotModuleWithPriority extends BasicBotModule {
    priority: number;
}

export type BotModule = BasicBotModule | BotModuleWithPriority;

export interface BotUtils {
    cooldownManager: CommandCooldownManager;
    statusManager: LiveStatusManager;
    prometheus: PrometheusExposer;
    idLoginPairs: IdLoginPairProvider;
    permissions: PermissionProvider;
}
