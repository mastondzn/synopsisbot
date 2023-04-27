import { type Collection } from '@discordjs/collection';
import { type ApiClient } from '@twurple/api';
import { type ChatClient, type PrivateMessage } from '@twurple/chat';
import { type EventSubWsListener } from '@twurple/eventsub-ws';
import { type Redis } from 'ioredis';

import { type NodePgDatabase } from '@synopsis/db';

import { type ShardedChatClient } from '~/client';
import { type ChatClientShard } from '~/client/shard';
import { type CommandCooldownManager } from '~/utils/cooldown';
import { type LiveStatusManager } from '~/utils/live-manager';

export type ChatClientEvents = Exclude<Extract<keyof ChatClient, `on${string}`>, 'on'>;

export type EventHandler<T extends ChatClientEvents> = Parameters<ChatClient[T]>[0];
export type EventHandlerParams<T extends ChatClientEvents> = Parameters<EventHandler<T>>;

export type BasicEventHandler = ChatClientEvents extends infer T
    ? T extends ChatClientEvents
        ? { event: T; description?: string; handler: EventHandler<T> }
        : never
    : never;

export interface BotContext {
    chat: ShardedChatClient;
    api: ApiClient;
    db: NodePgDatabase;
    cache: Redis;
    eventSub: EventSubWsListener;
    commands: Collection<string, BotCommand>;
    events: Collection<string, BotEventHandler>;
    modules: Collection<string, BotModule>;
    utils: BotUtils;
}

export type BotEventHandler = ChatClientEvents extends infer T
    ? T extends ChatClientEvents
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

export type OnMessageEventHandlerParams = Parameters<EventHandler<'onMessage'>>;
export interface OnMessageEventHandlerParamsAsObject {
    channel: OnMessageEventHandlerParams[0];
    userName: OnMessageEventHandlerParams[1];
    text: OnMessageEventHandlerParams[2];
}

export type ChatMessage = PrivateMessage & OnMessageEventHandlerParamsAsObject;

export type BotCommandContext = BotContext & {
    shard: ChatClientShard;
    msg: ChatMessage;
};

export interface BotCommand {
    name: string;
    description?: string;
    aliases?: string[];
    cooldown?: {
        user: number; // seconds
        global: number; // seconds
    };
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
}
