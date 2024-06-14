import type { PrivmsgMessage } from '@mastondzn/dank-twitch-irc';
import locatePromise from 'p-locate';

import { CancellationError } from '~/errors/cancellation';
import { UserError } from '~/errors/user';
import { simplifyCommandPermissions } from '~/helpers/command/permission';
import type { BasicCommand } from '~/helpers/command/types';
import { permissions } from '~/providers/permissions';
import { helix } from '~/services/apis/helix';
import { db } from '~/services/database';

// checks should return true if they are ok

export async function ensureValidChannelMode(message: PrivmsgMessage): Promise<void> {
    // i don't think running the promises in parallel is worth it
    const channel = await db.query.channels.findFirst({
        columns: { mode: true },
        where: ({ twitchId }, { eq }) => eq(twitchId, message.channelID),
    });

    if (!channel?.mode || channel.mode === 'readonly') {
        throw new CancellationError();
    }

    if (channel.mode === 'all') {
        return;
    }

    // TODO: should probably either cache or use eventsub
    const stream = await helix.streams.getStreamByUserId(message.channelID);

    if (!stream && channel.mode === 'offlineonly') return;
    if (stream && channel.mode === 'liveonly') return;

    throw new CancellationError();
}

export async function ensurePermitted(
    message: PrivmsgMessage,
    command: BasicCommand,
): Promise<void> {
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

    if (!located) {
        throw new UserError('You are not allowed to do that.');
    }
}
