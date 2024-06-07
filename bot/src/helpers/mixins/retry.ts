import { type ChatClient, type ClientMixin, applyReplacements } from '@mastondzn/dank-twitch-irc';

import { retry } from '~/helpers/retry';

async function replacement<TArguments extends unknown[]>(
    oldFunction: (...args: TArguments) => Promise<void>,
    ...args: TArguments
): Promise<void> {
    await retry(() => oldFunction(...args), {
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
