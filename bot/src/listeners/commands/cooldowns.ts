import type { PrivmsgMessage } from '@mastondzn/dank-twitch-irc';

import { CancellationError } from '~/errors/cancellation';
import type { BasicCommand } from '~/helpers/command/types';
import { TTLSet } from '~/helpers/ttl-set';

const defaultUserCooldown = 3;

function cooldownKey(message: Pick<PrivmsgMessage, 'senderUsername'>) {
    return `ucd:${message.senderUsername}`;
}

const set = new TTLSet<string>();

export const cooldowns = {
    isOnCooldown: (message: Pick<PrivmsgMessage, 'senderUsername'>): boolean => {
        const key = cooldownKey(message);

        const existing = set.has(key);
        if (existing) {
            return true;
        }

        return false;
    },

    addCooldown: (
        message: Pick<PrivmsgMessage, 'senderUsername'>,
        command: Pick<BasicCommand, 'cooldown'>,
    ) => {
        const time = command.cooldown ?? defaultUserCooldown;
        const key = cooldownKey(message);

        set.set(key, time * 1000);
    },

    removeCooldown: (message: Pick<PrivmsgMessage, 'senderUsername'>) => {
        const key = cooldownKey(message);
        set.delete(key);
    },

    ensure: (message: Pick<PrivmsgMessage, 'senderUsername'>) => {
        if (cooldowns.isOnCooldown(message)) {
            throw new CancellationError();
        }
    },
};
