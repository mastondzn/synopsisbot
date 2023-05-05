import { type ChatClient, type PrivmsgMessage } from '@kararty/dank-twitch-irc';

export interface WaitForMessageOptions {
    chat: ChatClient;
    timeout?: number;
    filter: MessageFilter;
}

export type MessageFilter = (message: PrivmsgMessage) => unknown;

export const waitForMessage = ({
    chat: chat,
    timeout = 10,
    filter,
}: WaitForMessageOptions): Promise<PrivmsgMessage> => {
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

export interface WaitForMessagesOptions extends WaitForMessageOptions {
    exitOn?: MessageFilter;
}

export const waitForMessages = ({
    chat,
    timeout = 10,
    filter,
    exitOn,
}: WaitForMessagesOptions): Promise<PrivmsgMessage[]> => {
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
