import type { PrivmsgMessage } from '@kararty/dank-twitch-irc';

import type { BasicCommand } from '~/helpers/command';
import { TTLSet } from '~/helpers/ttl-set';

const defaultUserCooldown = 3;

function cooldownKey(message: Pick<PrivmsgMessage, 'senderUsername'>) {
    return `ucd:${message.senderUsername}`;
}

class CommandCooldownManager extends TTLSet<string> {
    public isOnCooldown(message: Pick<PrivmsgMessage, 'senderUsername'>): boolean {
        const key = cooldownKey(message);

        const existing = this.has(key);
        if (existing) {
            return true;
        }

        return false;
    }

    public addCooldown(
        message: Pick<PrivmsgMessage, 'senderUsername'>,
        command: Pick<BasicCommand, 'cooldown'>,
    ) {
        const time = command.cooldown ?? defaultUserCooldown;
        const key = cooldownKey(message);

        this.set(key, time * 1000);
    }

    public removeCooldown(message: Pick<PrivmsgMessage, 'senderUsername'>) {
        const key = cooldownKey(message);
        this.delete(key);
    }
}

export const cooldowns = new CommandCooldownManager();
