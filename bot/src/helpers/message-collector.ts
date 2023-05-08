import { type ChatClient, type PrivmsgMessage } from '@kararty/dank-twitch-irc';

export type MessageFilter = (message: PrivmsgMessage) => unknown;

export interface CollectMessageOptions {
    chat: ChatClient;
    timeout?: number;
    filter: MessageFilter;
}

export const collectMessage = ({
    chat,
    timeout = 10,
    filter,
}: CollectMessageOptions): Promise<PrivmsgMessage> => {
    return new Promise((resolve, reject) => {
        const handler = (msg: PrivmsgMessage): unknown => {
            if (filter(msg)) return resolve(msg);
            return chat.once('PRIVMSG', handler);
        };

        chat.once('PRIVMSG', handler);

        setTimeout(() => {
            reject(new Error(`Waiting for message timed out after ${timeout}ms`));
        }, timeout * 1000);
    });
};

export interface CollectMessagesOptions extends CollectMessageOptions {
    exitOn?: MessageFilter;
}

export const collectMessages = ({
    chat,
    timeout = 10,
    filter,
    exitOn,
}: CollectMessagesOptions): Promise<PrivmsgMessage[]> => {
    return new Promise((resolve) => {
        const messages: PrivmsgMessage[] = [];
        const handler = (msg: PrivmsgMessage): void => {
            if (!filter(msg)) return;

            messages.push(msg);

            if (exitOn?.(msg)) {
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
};
