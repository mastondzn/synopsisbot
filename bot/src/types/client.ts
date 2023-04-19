import { type Collection } from '@discordjs/collection';
import { type ApiClient } from '@twurple/api';
import { type ChatClient, type PrivateMessage } from '@twurple/chat';
import { type Redis } from 'ioredis';

import { type NodePgDatabase } from '@synopsis/db';

import { type ShardedChatClient } from '~/client';

export type ChatClientEvents = Exclude<Extract<keyof ChatClient, `on${string}`>, 'on'>;

export type EventHandler<T extends ChatClientEvents> = Parameters<ChatClient[T]>[0];
export type EventHandlerParams<T extends ChatClientEvents> = Parameters<EventHandler<T>>;

export type BasicEventHandler = ChatClientEvents extends infer T
    ? T extends ChatClientEvents
        ? { event: T; description?: string; handler: EventHandler<T> }
        : never
    : never;

export interface BotEventHandlerContext {
    client: ShardedChatClient;
    api: ApiClient;
    db: NodePgDatabase;
    cache: Redis;
    commands: Collection<string, BotCommand>;
    events: Collection<string, BotEventHandler>;
    modules: Collection<string, BotModule>;
}

export type BotEventHandler = ChatClientEvents extends infer T
    ? T extends ChatClientEvents
        ? {
              event: T;
              description?: string;
              handler: (
                  ctx: BotEventHandlerContext & {
                      params: EventHandlerParams<T>;
                  }
              ) => Promise<void> | void;
          }
        : never
    : never;

type OnMessageEventHandlerParams = Parameters<EventHandler<'onMessage'>>;
interface OnMessageEventHandlerParamsAsObject {
    channel: OnMessageEventHandlerParams[0];
    userName: OnMessageEventHandlerParams[1];
    text: OnMessageEventHandlerParams[2];
}

export type BotCommandContext = BotEventHandlerContext & {
    msg: PrivateMessage & OnMessageEventHandlerParamsAsObject;
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

export interface BotModule {
    name: string;
    description?: string;
    register: (ctx: BotEventHandlerContext) => Promise<void> | void;
}
