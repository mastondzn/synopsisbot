import type { PrivmsgMessage } from '@kararty/dank-twitch-irc';
import { AlternateMessageModifier, ChatClient } from '@kararty/dank-twitch-irc';

import { RetryMixin } from '~/helpers/mixins';

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

    public async collectMessage({ filter, timeout = 10 }: {
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

    public async collectMessages({ filter, exitOn, timeout = 10 }: {
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
}

export const chat = new BotClient({
    rateLimits: 'default',
});

chat.use(new AlternateMessageModifier(chat));
chat.use(new RetryMixin());
