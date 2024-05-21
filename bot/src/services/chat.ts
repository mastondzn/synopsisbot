import type { PrivmsgMessage } from '@kararty/dank-twitch-irc';
import { AlternateMessageModifier, ChatClient } from '@kararty/dank-twitch-irc';

import { LogMixin, RetryMixin } from '~/helpers/mixins';

class BotClient extends ChatClient {
    public async login({
        username,
        password,
    }: {
        username: string;
        password: string;
    }): Promise<void> {
        this.configuration.username = username;
        this.configuration.password = password;
        await this.connect();
    }

    /**
     * Collects a single message that satisfies the filter
     * @param options Options for the collection
     * @param options.filter Predicate that the message should satisfy
     * @param options.timeout Time in seconds to wait until the promise rejects
     * @returns Promise that resolves to the message
     *
     * @example
     * ```typescript
     * // collects the first message from 'someuser'
     * const message = await chat.collectMessage({
     *     filter: (message) => message.senderUsername === 'someuser',
     *     timeout: 10,
     * });
     * ```
     */
    public async collectMessage({
        filter,
        timeout = 10,
    }: {
        filter: (message: PrivmsgMessage) => unknown;
        timeout?: number;
    }): Promise<PrivmsgMessage> {
        return new Promise((resolve, reject) => {
            const handler = (message: PrivmsgMessage) => {
                if (filter(message)) {
                    resolve(message);
                    return;
                }
                this.removeListener('PRIVMSG', handler);
            };

            this.on('PRIVMSG', handler);

            setTimeout(() => {
                reject(new Error(`Waiting for message timed out after ${timeout}s`));
            }, timeout * 1000);
        });
    }

    /**
     * Collects a single message that satisfies the predicate
     * @param options Options for the collection
     * @param options.filter Predicate that the message should satisfy
     * @param options.exitOn Predicate that should return true to exit the collection
     * @param options.timeout Time in seconds to wait until the promise rejects
     * @returns Promise that resolves to the message
     *
     * @example
     * const message = await chat.collectMessage({
     *     filter: (message) => message.senderUsername === 'someuser',
     *     timeout: 10,
     * });
     */
    public async collectMessages({
        filter,
        exitOn,
        timeout = 10,
    }: {
        filter: (message: PrivmsgMessage) => unknown;
        exitOn?: (message: PrivmsgMessage, collected: PrivmsgMessage[]) => unknown;
        timeout?: number;
    }): Promise<PrivmsgMessage[]> {
        return new Promise((resolve) => {
            const messages: PrivmsgMessage[] = [];
            const handler = (message: PrivmsgMessage): void => {
                if (!filter(message)) {
                    return;
                }

                messages.push(message);
                if (exitOn?.(message, messages)) {
                    this.removeListener('PRIVMSG', handler);
                    resolve(messages);
                }
            };

            this.on('PRIVMSG', handler);

            setTimeout(() => {
                this.removeListener('PRIVMSG', handler);
                resolve(messages);
            }, timeout * 1000);
        });
    }

    public async getLatency(): Promise<number> {
        const now = Date.now();
        await this.ping();
        return Date.now() - now;
    }
}

export const chat = new BotClient({
    rateLimits: 'default',
});

chat.use(new AlternateMessageModifier(chat));
chat.use(new LogMixin());
chat.use(new RetryMixin());
