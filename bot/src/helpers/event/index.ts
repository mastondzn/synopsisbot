import type { ClientEvents } from '@mastondzn/dank-twitch-irc';

export type EventListeners = {
    [Key in keyof ClientEvents]: (emitted: ClientEvents[Key][0]) => Promise<void> | void;
};

export function createEventListener<T extends keyof ClientEvents>(handler: {
    event: T;
    description?: string;
    listener: EventListeners[T];
}) {
    return handler;
}

export type BotEventListener = ReturnType<typeof createEventListener>;
