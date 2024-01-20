import type { ClientEvents } from '@kararty/dank-twitch-irc';

export type EventHandlers = {
    [Key in keyof ClientEvents]: (emitted: ClientEvents[Key][0]) => Promise<void> | void;
};

export function defineEventHandler<T extends keyof ClientEvents>(handler: {
    event: T;
    description?: string;
    handler: EventHandlers[T];
}) {
    return handler;
}

export type BotEventHandler = ReturnType<typeof defineEventHandler>;
