import { type ChatClient, type ClientMixin, applyReplacements } from '@kararty/dank-twitch-irc';

import { retry } from '~/helpers/retry';

async function replacement<A extends unknown[]>(
    oldFunction: (...arguments_: A) => Promise<void>,
    ...arguments_: A
): Promise<void> {
    await retry(() => oldFunction(...arguments_), {
        retries: 3,
        delay: 150,
    });
}

export class RetryMixin implements ClientMixin {
    applyToClient(client: ChatClient): void {
        applyReplacements(this, client, {
            say: replacement,
            me: replacement,
            reply: replacement,
        });
    }
}
