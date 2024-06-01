import { Lock } from 'semaphore-async-await';

import { CancellationError } from '~/errors/cancellation';

const map = new Map<string, Lock>();

/**
 * Locks determine if an user has another command running.
 * They are separate from command cooldowns (which get added after the command is executed).
 */
export const locks = {
    map,
    get: (key: string) => {
        const semaphore = map.get(key) ?? new Lock();
        map.set(key, semaphore);
        return semaphore;
    },
    release: (key: string): void => map.get(key)?.release(),
    ensure: (key: string) => {
        if (!locks.get(key).tryAcquire()) {
            throw new CancellationError();
        }
    },
    remove: (key: string) => map.delete(key),
};
