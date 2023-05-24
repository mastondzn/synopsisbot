import { applyReplacements, type ChatClient, type ClientMixin } from '@kararty/dank-twitch-irc';

import { retry } from '~/helpers/retry';

const replacement = async <A extends unknown[]>(
    oldFn: (...args: A) => Promise<void>,
    ...args: A
): Promise<void> => {
    return await retry(() => oldFn(...args), {
        retries: 3,
        delay: 350,
        onRetry: (err: Error, attempt: number) => {
            console.error(`[retry] say attempt ${attempt}`);
            console.error(err);
        },
    });
};

export class RetryMixin implements ClientMixin {
    applyToClient(client: ChatClient): void {
        applyReplacements(this, client, {
            say: replacement,
            me: replacement,
            reply: replacement,
        });
    }
}
