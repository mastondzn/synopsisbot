import type { Collection } from '@discordjs/collection';
import type { PrivmsgMessage } from '@kararty/dank-twitch-irc';
import { AlternateMessageModifier, ChatClient } from '@kararty/dank-twitch-irc';

import type { BotEventHandler } from '~/helpers/event';
import { RetryMixin } from '~/helpers/mixins';
import type { BotModule } from '~/helpers/module';

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

    public registerEvents(events: Collection<string, BotEventHandler>): void {
        for (const [, { event, handler }] of events) {
            this.on(event, (...parameters) => {
                // @ts-expect-error ts cant realise this is fine
                return void handler(...parameters);
            });
        }
    }

    public async registerModules(modules: Collection<string, BotModule>): Promise<void> {
        const orderedModules = [...modules.values()].sort((a, b) => {
            if (!('priority' in a) && !('priority' in b)) return 0;
            if (!('priority' in a)) return 1;
            if (!('priority' in b)) return -1;
            if (a.priority === b.priority) return 0;
            return a.priority < b.priority ? 1 : -1;
        });

        for (const module of orderedModules) {
            await module.register();
        }
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
