import { type ChatClientShard } from '~/client/shard';
import { type ChatMessage } from '~/types/client';

export interface WaitForMessageOptions {
    shard: ChatClientShard;
    timeout?: number;
    filter: MessageFilter;
}

export type MessageFilter = (message: ChatMessage) => unknown;

export const waitForMessage = ({
    shard,
    timeout = 10,
    filter,
}: WaitForMessageOptions): Promise<ChatMessage> =>
    new Promise((resolve, reject) => {
        const handler = shard.onMessage((channel, userName, text, msg) => {
            const message: ChatMessage = Object.assign(msg, {
                channel,
                userName,
                text,
            });
            if (!filter(message)) return;

            shard.removeListener(handler);
            resolve(message);
        });

        setTimeout(() => {
            shard.removeListener(handler);
            reject(new Error(`Waiting for message timed out after ${timeout}ms`));
        }, timeout);
    });

export interface WaitForMessagesOptions extends WaitForMessageOptions {
    exitOn?: MessageFilter;
}

export const waitForMessages = ({
    shard,
    timeout = 10,
    filter,
    exitOn,
}: WaitForMessagesOptions): Promise<ChatMessage[]> => {
    return new Promise((resolve) => {
        const messages: ChatMessage[] = [];

        const handler = shard.onMessage((channel, userName, text, msg) => {
            const message: ChatMessage = Object.assign(msg, {
                channel,
                userName,
                text,
            });

            if (!filter(message)) return;
            messages.push(message);
            if (exitOn?.(message)) {
                shard.removeListener(handler);
                resolve(messages);
            }
        });

        setTimeout(() => {
            shard.removeListener(handler);
            resolve(messages);
        }, timeout);
    });
};
