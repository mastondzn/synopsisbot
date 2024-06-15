import type { PrivmsgMessage } from '@mastondzn/dank-twitch-irc';
import { mapValues } from 'remeda';
import { z } from 'zod';
import { fromZodError } from 'zod-validation-error';

import { prefix } from './prefix';
import type { BasicCommand, CommandContext } from './types';
import { splitOnce } from '../string';
import { UserError } from '~/errors/user';
import { helix } from '~/services/apis/helix';

export function getWantedCommand({ messageText: text }: Pick<PrivmsgMessage, 'messageText'>) {
    return splitOnce(text.replace(prefix, ''), ' ')[0];
}

export interface CommandParameters {
    text: string | null;
    /** This can be the command alias, which is why its useful */
    command: string;
    split: string[];
}

export function parseParameters({
    messageText: text,
}: Pick<PrivmsgMessage, 'messageText'>): CommandParameters {
    const [command, ...split] = text.replace(prefix, '').split(/\s+/);
    if (!command) {
        throw new Error('Failed to parse command');
    }

    return {
        text: split.length === 0 ? null : split.join(' '),
        command,
        split,
    };
}

export async function parseParametersAndOptions(
    message: Pick<PrivmsgMessage, 'messageText'>,
    command: Pick<BasicCommand, 'options'>,
): Promise<{
    options: Record<string, unknown>;
    parameters: CommandParameters;
}> {
    const parameters = parseParameters(message);

    if (!command.options) {
        return { options: {}, parameters };
    }

    const raw: Record<string, string> = {};

    for (const [recordKey, { aliases }] of Object.entries(command.options)) {
        const wantedKeys = aliases ? [recordKey, ...aliases] : [recordKey];

        for (const [index, word] of parameters.split.entries()) {
            const [key, value] = splitOnce(word, ':');
            // we want to accept empty strings as values
            if (!key || typeof value !== 'string') continue;

            if (wantedKeys.includes(key) && raw[recordKey] === undefined) {
                raw[recordKey] = value;
                parameters.split.splice(index, 1);
            }
        }
    }

    const schema = z.object(mapValues(command.options, ({ schema }) => schema));

    const parsed = await schema.safeParseAsync(raw);

    if (!parsed.success) {
        const human = fromZodError(parsed.error, {
            prefix: 'Could not parse options',
        }).message.replaceAll('received', 'got');
        throw new UserError(
            human.length > 460
                ? 'Could not parse options, and too many errors to display in chat.'
                : human,
        );
    }

    return {
        options: parsed.data,
        parameters: {
            text: parameters.split.length === 0 ? null : parameters.split.join(' '),
            split: parameters.split,
            command: parameters.command,
        },
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
    const user = context.parameters.split
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
