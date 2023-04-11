import { type ChatClient } from '@twurple/chat';

export type ChatClientEvents = Exclude<Extract<keyof ChatClient, `on${string}`>, 'on'>;

export type EventHandler<T extends ChatClientEvents> = Parameters<ChatClient[T]>[0];

export type BaseEvent = ChatClientEvents extends infer T
    ? T extends ChatClientEvents
        ? {
              event: T;
              handler: EventHandler<T>;
          }
        : never
    : never;
