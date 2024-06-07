import { type ChatClient, type ClientMixin, applyReplacements } from '@mastondzn/dank-twitch-irc';

import { logger } from '../logger';

function createReplacement<TArguments extends string[]>(methodName: string) {
    return (oldFunction: (...args: TArguments) => Promise<void>, ...args: TArguments) => {
        logger.self(`${methodName}: [${args.join(', ')}]`);
        return oldFunction(...args);
    };
}

export class LogMixin implements ClientMixin {
    applyToClient(client: ChatClient): void {
        applyReplacements(this, client, {
            say: createReplacement('say'),
            me: createReplacement('me'),
            reply: createReplacement('reply'),
        });
    }
}
