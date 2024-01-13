import type { Collection } from '@discordjs/collection';
import { AlternateMessageModifier, ChatClient } from '@kararty/dank-twitch-irc';
import { env } from '@synopsis/env/node';

import { authProvider } from './auth';
import type { BotEventHandler, BotModule } from '~/types/client';
import { RetryMixin } from '~/utils';

class BotClient extends ChatClient {
    public registerEvents(events: Collection<string, BotEventHandler>): void {
        for (const [, { event, handler }] of events) {
            this.on(event, (...parameters) => {
                void handler({ ...this, params: parameters as never } as never);
            });
        }
    }

    public async registerModules(modules: Collection<string, BotModule>): void {
        const orderedModules = [...modules.values()].sort((a, b) => {
            if (!('priority' in a) && !('priority' in b)) {
                return 0;
            }
            if (!('priority' in a)) {
                return 1;
            }
            if (!('priority' in b)) {
                return -1;
            }
            if (a.priority === b.priority) {
                return 0;
            }
            return a.priority < b.priority ? 1 : -1;
        });

        for (const module of orderedModules) {
            await module.register(this);
        }
    }
}

const token = await authProvider.getAccessTokenForUser(env.TWITCH_BOT_ID);
if (!token) {
    throw new Error('could not obtain token from auth provider');
}

export const chat = new BotClient({
    username: env.TWITCH_BOT_USERNAME,
    password: `oauth:${token.accessToken}`,
    rateLimits: 'default',
});

chat.use(new AlternateMessageModifier(chat));
chat.use(new RetryMixin());
