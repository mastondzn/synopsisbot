import { cache } from './redis';
import type { Command } from '~/helpers/command';

export interface CommandCooldownManagerCheckOptions {
    command: Command;
    channel: string;
    userName: string;
}

const defaultUserCooldown = 5;
const defaultGlobalCooldown = 0;

function makeUserCooldownKey({ userName, channel, command }: CommandCooldownManagerCheckOptions) {
    return `ucd:${channel}:${command.name}:${userName}`;
}

function makeGlobalCooldownKey({
    channel,
    command,
}: Omit<CommandCooldownManagerCheckOptions, 'userName'>) {
    return `gcd:${channel}:${command.name}`;
}

class CommandCooldownManager {
    // returns true if user is on cooldown
    // returns false if user is ok
    async isOnCooldown({
        command,
        channel,
        userName,
    }: CommandCooldownManagerCheckOptions): Promise<boolean> {
        const userCooldown = command.cooldown?.user ?? defaultUserCooldown;
        const globalCooldown = command.cooldown?.global ?? defaultGlobalCooldown;

        const userCooldownKey = makeUserCooldownKey({ command, channel, userName });
        const globalCooldownKey = makeGlobalCooldownKey({ command, channel });

        const [existingUserEntry, existingGlobalEntry] = await Promise.all([
            cache.exists(userCooldownKey),
            globalCooldown > 0 ? cache.exists(globalCooldownKey) : Promise.resolve(0),
        ]);

        if (existingUserEntry || existingGlobalEntry) {
            return true;
        }

        await Promise.all([
            cache.set(userCooldownKey, '1', 'EX', userCooldown),
            globalCooldown > 0
                ? cache.set(globalCooldownKey, '1', 'EX', globalCooldown)
                : Promise.resolve(),
        ]);

        return true;
    }

    async clear({
        command,
        channel,
        userName,
    }: CommandCooldownManagerCheckOptions): Promise<void> {
        const userCooldownKey = makeUserCooldownKey({ command, channel, userName });
        const globalCooldownKey = makeGlobalCooldownKey({ command, channel });

        await Promise.all([cache.del(userCooldownKey), cache.del(globalCooldownKey)]);
    }
}

export const cooldowns = new CommandCooldownManager();
