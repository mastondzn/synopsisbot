import type { PrivmsgMessage } from '@kararty/dank-twitch-irc';
import { env } from '@synopsis/env/node';
import locatePromise from 'p-locate';

import { type BasicCommand, simplifyCommandPermissions } from '.';
import { cooldowns, permissions } from '~/providers';
import { cache, db, helix } from '~/services';

// checks should return true if they are ok

export async function isValidChannelMode(message: PrivmsgMessage): Promise<boolean> {
    // i don't think running the promises in parallel is worth it
    const mode = await db.find.channelModeById(message.channelID);

    if (!mode || mode === 'readonly') return false;
    if (mode === 'all') return true;

    // TODO: should probably either cache or use eventsub
    const stream = await helix.streams.getStreamByUserId(message.channelID);
    if (!stream && mode === 'offlineonly') return true;
    if (stream && mode === 'liveonly') return true;

    return false;
}

export function isNotOnCooldown(message: PrivmsgMessage): boolean {
    return !cooldowns.isOnCooldown(message);
}

// if there is a development process running, don't reply to commands in default channels
export async function developmentIsNotRunning(message: PrivmsgMessage): Promise<boolean> {
    if (env.NODE_ENV !== 'production') return true;

    const inDefaultChannel = [
        env.TWITCH_BOT_OWNER_USERNAME, //
        env.TWITCH_BOT_USERNAME,
    ].includes(message.channelName);
    if (!inDefaultChannel) return true;

    const redisEntry = await cache.exists('dev-announce');
    return !redisEntry;
}

export async function isPermitted(
    message: PrivmsgMessage,
    command: BasicCommand,
): Promise<boolean> {
    const wantedPermissions = simplifyCommandPermissions(command);

    const located = await locatePromise(
        wantedPermissions.map(async (permission) => {
            // we allow it through when custom mode, we check for permissions in the command block itself
            if ('mode' in permission) return true;

            // TODO: this can make multiple concurrent requests to the database, should probably be optimized
            return permissions.pleasesPermissions(permission, message);
        }),
        (result) => result,
    );

    return !!located;
}
