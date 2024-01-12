import type { ChatClient, PrivmsgMessage } from '@kararty/dank-twitch-irc';

export type MessageFilter = (message: PrivmsgMessage) => unknown;

export interface CollectMessageOptions {
    chat: ChatClient
    timeout?: number
    filter: MessageFilter
}

export function collectMessage({
    chat,
    timeout = 10,
    filter,
}: CollectMessageOptions): Promise<PrivmsgMessage> {
    return new Promise((resolve, reject) => {
        const handler = (message: PrivmsgMessage): unknown => {
            if (filter(message)) {
                return resolve(message);
            }
            return chat.once('PRIVMSG', handler);
        };

        chat.once('PRIVMSG', handler);

        setTimeout(() => {
            reject(new Error(`Waiting for message timed out after ${timeout}ms`));
        }, timeout * 1000);
    });
}

export interface CollectMessagesOptions extends CollectMessageOptions {
    exitOn?: (message: PrivmsgMessage, collected: PrivmsgMessage[]) => unknown
}

export function collectMessages({
    chat,
    timeout = 10,
    filter,
    exitOn,
}: CollectMessagesOptions): Promise<PrivmsgMessage[]> {
    return new Promise((resolve) => {
        const messages: PrivmsgMessage[] = [];
        const handler = (message: PrivmsgMessage): void => {
            if (!filter(message)) { return; }

            messages.push(message);

            if (exitOn?.(message, messages)) {
                chat.removeListener('PRIVMSG', handler);
                resolve(messages);
            }
        };

        chat.on('PRIVMSG', handler);

        setTimeout(() => {
            chat.removeListener('PRIVMSG', handler);
            resolve(messages);
        }, timeout * 1000);
    });
}
