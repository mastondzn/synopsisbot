import { type ChatClient, type ClientMixin, applyReplacements } from '@mastondzn/dank-twitch-irc';

import { retry } from '~/helpers/retry';

async function replacement<TArguments extends unknown[]>(
    oldFunction: (...arguments_: TArguments) => Promise<void>,
    ...arguments_: TArguments
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
