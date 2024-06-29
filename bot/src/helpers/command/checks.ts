import type { PrivmsgMessage } from '@mastondzn/dank-twitch-irc';

import { CancellationError } from '~/errors/cancellation';
import { PermissionError } from '~/errors/permission';
import type { BasicCommand, CommandPermission } from '~/helpers/command/types';
import { mapMessageToContext, permissions } from '~/providers/permissions';
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
    command: Pick<BasicCommand, 'permissions'>,
): Promise<void> {
    const defaults: Required<CommandPermission> = {
        global: 'normal',
        local: 'normal',
    };

    // custom means the command will handle permissions itself
    if (command.permissions === 'custom') return;

    const context = mapMessageToContext(message);

    const required = {
        local: command.permissions?.local ?? defaults.local,
        global: command.permissions?.global ?? defaults.global,
    };

    const { global, local } = await permissions.satisfiesPermissions(required, context);

    if (!(global.satisfies && local.satisfies)) {
        throw new PermissionError({
            concatInfo: true,
            announce: !(global.level === 'banned' || local.level === 'banned'),
            ...(global.satisfies
                ? { global: { required: required.global, current: global.level } }
                : {}),
            ...(local.satisfies
                ? { local: { required: required.local, current: local.level } }
                : {}),
        });
    }
}
