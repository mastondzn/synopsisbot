import type { PrivmsgMessage } from '@kararty/dank-twitch-irc';

import type { BotCommandContext } from '~/types/client';

export function parseCommandParams(message: string | PrivmsgMessage) {
    const text = typeof message === 'string' ? message : message.messageText;

    const [prefix, command, ...list] = text.split(/ +/);
    if (!prefix || !command) { throw new Error('Failed to parse command'); }
    return {
        text: text.replace(`${prefix} ${command}`, '').trim() || null,
        prefix,
        command,
        list,
    };
}

export async function parseUserParameter(
    context: BotCommandContext,
    index: number,
    withId: true
): Promise<{ id: string, login: string, ok: true } | { ok: false, reason: string }>;
export async function parseUserParameter(
    context: BotCommandContext,
    index: number
): Promise<{ login: string, ok: true } | { ok: false, reason: string }>;
export async function parseUserParameter(
    context: BotCommandContext,
    index: number,
    withId?: boolean,
): Promise<
    | { id: string, login: string, ok: true }
    | { ok: false, reason: string }
    | { login: string, ok: true }
> {
    const user = context.params.list
        .at(index)
        ?.toLowerCase()
        .replace(/^(@|#)+/, '')
        .replace(/^_+$/, context.msg.channelName);

    if (!user) {
        return { ok: false, reason: 'Missing user/channel parameter.' };
    }

    if (!/^\w+$/.test(user)) {
        return { ok: false, reason: 'Invalid user/channel parameter.' };
    }

    if (!withId) {
        return { login: user, ok: true };
    }

    const id = await context.utils.idLoginPairs.getId(user);
    if (!id) {
        return { ok: false, reason: 'Could not fetch user/channel.' };
    }

    return { id, login: user, ok: true };
}
