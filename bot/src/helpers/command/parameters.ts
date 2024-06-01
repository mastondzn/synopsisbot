import type { PrivmsgMessage } from '@mastondzn/dank-twitch-irc';

import { prefix } from './prefix';
import type { CommandContext } from './types';
import { splitOnce } from '../string';
import { helix } from '~/services/apis/helix';

export function getWantedCommand({ messageText: text }: Pick<PrivmsgMessage, 'messageText'>) {
    return splitOnce(text.replace(prefix, ''), ' ')[0];
}

export interface CommandParameters {
    text: string | null;
    command: string;
    split: string[];
    rest: string[];
}

export function parseParameters({
    messageText: text,
}: Pick<PrivmsgMessage, 'messageText'>): CommandParameters {
    const split = text.split(/\s+/);
    const [prefix, command, ...rest] = split;
    if (!prefix || !command) {
        throw new Error('Failed to parse command');
    }

    return {
        text: rest.length === 0 ? null : rest.join(' '),
        split,
        command,
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

    const helixUser = await helix.users.getUserByName(user);
    if (!helixUser) {
        return { ok: false, reason: 'Could not fetch user/channel.' };
    }

    return { id: helixUser.id, login: user, ok: true };
}
