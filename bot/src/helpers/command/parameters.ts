import type { PrivmsgMessage } from '@mastondzn/dank-twitch-irc';
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
    command: string;
    split: string[];
    rest: string[];
}

export function parseParameters({
    messageText: text,
}: Pick<PrivmsgMessage, 'messageText'>): CommandParameters {
    const split = text.replace(prefix, '').split(/\s+/);
    const [command, ...rest] = split;
    if (!command) {
        throw new Error('Failed to parse command');
    }

    return {
        text: rest.length === 0 ? null : rest.join(' '),
        split,
        command,
        rest,
    };
}

export function parseParametersAndOptions(
    message: Pick<PrivmsgMessage, 'messageText'>,
    command: Pick<BasicCommand, 'options'>,
): {
    options: Record<string, unknown>;
    parameters: CommandParameters;
} {
    const parameters = parseParameters(message);

    if (!command.options) {
        return { options: {}, parameters };
    }

    const raw: Record<string, string> = {};

    for (const [recordKey, { aliases: keyAliases }] of Object.entries(command.options)) {
        const wantedKeys = keyAliases ? [recordKey, ...keyAliases] : [recordKey];

        for (const word of parameters.rest) {
            const [key, value] = word.split(':');
            // we want to accept empty strings as values
            if (!key || typeof value !== 'string') continue;

            if (wantedKeys.includes(key) && raw[recordKey] === undefined) {
                raw[recordKey] = value;

                // we want to edit the parameters as we go to cleanup the parameters,
                // TODO: this is probably slow the way it is
                let filtered = false;
                parameters.rest = parameters.rest.filter((current) => {
                    if (filtered) return true;
                    if (current === word) {
                        filtered = true;
                        return false;
                    }
                    return true;
                });
            }
        }
    }

    const schema = z.object(
        Object.fromEntries(
            Object.entries(command.options).map(([key, { schema }]) => [key, schema] as const),
        ),
    );

    const parsed = schema.safeParse(raw);

    if (!parsed.success) {
        const human = fromZodError(parsed.error, {
            prefix: 'Could not parse options',
        }).message.replaceAll('received', 'got');
        throw new UserError({
            message:
                human.length > 460
                    ? 'Could not parse options, and too many errors to display in chat.'
                    : human,
        });
    }

    return {
        options: parsed.data,
        parameters: {
            text: parameters.rest.length === 0 ? null : parameters.rest.join(' '),
            split: [parameters.command, ...parameters.rest],
            command: parameters.command,
            rest: parameters.rest,
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
