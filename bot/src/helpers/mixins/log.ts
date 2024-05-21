import { type ChatClient, type ClientMixin, applyReplacements } from '@kararty/dank-twitch-irc';

import { prefixes } from '../log-prefixes';

function createReplacement<TArguments extends string[]>(methodName: string) {
    return (
        oldFunction: (...arguments_: TArguments) => Promise<void>,
        ...arguments_: TArguments
    ) => {
        console.log(prefixes.self, `${methodName}: [${arguments_.join(', ')}]`);
        return oldFunction(...arguments_);
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
