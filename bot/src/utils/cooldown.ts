import { type Redis } from 'ioredis';

import { type BotCommand } from '~/types/client';

export interface CommandCooldownManagerCheckOptions {
    command: BotCommand;
    channel: string;
    userName: string;
}

const defaultUserCooldown = 10;
const defaultGlobalCooldown = 3;

const makeUserCooldownKey = ({ userName, channel, command }: CommandCooldownManagerCheckOptions) =>
    `ucd:${channel}:${command.name}:${userName}`;

const makeGlobalCooldownKey = ({
    channel,
    command,
}: Omit<CommandCooldownManagerCheckOptions, 'userName'>) => `gcd:${channel}:${command.name}`;

export class CommandCooldownManager {
    cache: Redis;

    constructor({ cache }: { cache: Redis }) {
        this.cache = cache;
    }

    async check({
        command,
        channel,
        userName,
    }: CommandCooldownManagerCheckOptions): Promise<{ isOnCooldown: boolean }> {
        const userCooldown = command.cooldown?.user ?? defaultUserCooldown;
        const globalCooldown = command.cooldown?.global ?? defaultGlobalCooldown;

        const userCooldownKey = makeUserCooldownKey({ command, channel, userName });
        const globalCooldownKey = makeGlobalCooldownKey({ command, channel });

        const [existingUserEntry, existingGlobalEntry] = await Promise.all([
            this.cache.exists(userCooldownKey),
            this.cache.exists(globalCooldownKey),
        ]);

        if (existingUserEntry || existingGlobalEntry) return { isOnCooldown: true };

        await Promise.all([
            this.cache.set(userCooldownKey, '1', 'EX', userCooldown),
            this.cache.set(globalCooldownKey, '1', 'EX', globalCooldown),
        ]);

        return { isOnCooldown: false };
    }
}