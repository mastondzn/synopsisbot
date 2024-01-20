import type { PrivmsgMessage } from '@kararty/dank-twitch-irc';

import type { CommandContext } from '.';
import { prefix } from './prefix';
import { api } from '~/services/api';

export function getCommandName(message: string | PrivmsgMessage) {
    const text = typeof message === 'string' ? message : message.messageText;
    return text.replace(prefix, '').split(/\s+/)[0];
}

export function parseParameters(message: string | PrivmsgMessage) {
    const text = typeof message === 'string' ? message : message.messageText;

    const split = text.split(/\s+/);
    const [prefix, command = null, ...rest] = split;
    if (!prefix || !command) {
        throw new Error('Failed to parse command');
    }

    return {
        text: rest.join(' ') || null,
        split,
        command,
        prefix,
        rest,
    };
}

export async function parseUserParameter(
    context: CommandContext,
    index: number,
    withId: true,
): Promise<{ id: string; login: string; ok: true } | { ok: false; reason: string }>;
export async function parseUserParameter(
    context: CommandContext,
    index: number,
): Promise<{ login: string; ok: true } | { ok: false; reason: string }>;
export async function parseUserParameter(
    context: CommandContext,
    index: number,
    withId?: boolean,
): Promise<
    | { id: string; login: string; ok: true }
    | { ok: false; reason: string }
    | { login: string; ok: true }
> {
    const user = context.parameters.rest
        .at(index)
        ?.toLowerCase()
        .replace(/^(@|#)+/, '')
        .replace(/^_+$/, context.message.channelName);

    if (!user || !/^\w+$/.test(user)) {
        return { ok: false, reason: 'Missing user/channel parameter.' };
    }

    if (!withId) {
        return { login: user, ok: true };
    }

    const helixUser = await api.helix.users.getUserByName(user);
    if (!helixUser) {
        return { ok: false, reason: 'Could not fetch user/channel.' };
    }

    return { id: helixUser.id, login: user, ok: true };
}
