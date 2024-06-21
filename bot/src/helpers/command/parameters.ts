import type { PrivmsgMessage } from '@mastondzn/dank-twitch-irc';
import { mapValues } from 'remeda';
import { z } from 'zod';
import { fromZodError } from 'zod-validation-error';

import { prefix } from './prefix';
import type { BasicCommand } from './types';
import { splitOnce } from '../string';
import { UserError } from '~/errors/user';

export function getWantedCommand({ messageText: text }: Pick<PrivmsgMessage, 'messageText'>) {
    return splitOnce(text.replace(prefix, ''), ' ')[0];
}

export interface CommandParameters {
    text: string | null;
    /** This can be the command alias, which is why its useful */
    command: string;
    split: string[];
}

export function simplyParseParameters({
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

export async function parseParameters(
    message: Pick<PrivmsgMessage, 'messageText'>,
    command: Pick<BasicCommand, 'options' | 'arguments'>,
): Promise<{
    options: Record<string, unknown>;
    arguments: unknown[];
    parameters: CommandParameters;
}> {
    const { options = {}, arguments: args = [] } = command;

    const parameters = simplyParseParameters(message);
    const rawOptions: Record<string, string> = {};

    for (const [recordKey, { aliases }] of Object.entries(options)) {
        const wantedKeys = aliases ? [recordKey, ...aliases] : [recordKey];

        for (const [index, word] of parameters.split.entries()) {
            const [key, value] = splitOnce(word, ':');
            // we want to accept empty strings as values
            if (!key || typeof value !== 'string') continue;

            if (wantedKeys.includes(key) && rawOptions[recordKey] === undefined) {
                rawOptions[recordKey] = value;
                parameters.split.splice(index, 1);
            }
        }
    }

    const optionsSchema = z.object(mapValues(options, ({ schema }) => schema));
    const argumentsSchema = z.tuple(args).rest(z.string());

    const [parsedOptions, parsedArguments] = await Promise.all([
        optionsSchema.safeParseAsync(rawOptions),
        argumentsSchema.safeParseAsync(parameters.split),
    ]);

    if (!parsedOptions.success || !parsedArguments.success) {
        let message = 'Could not parse options or arguments: ';

        if (!parsedOptions.success) {
            message += fromZodError(parsedOptions.error, { prefix: null }).message;
        }

        if (!parsedArguments.success) {
            message += fromZodError(parsedArguments.error, { prefix: null }).message;
        }

        throw new UserError(
            message.length > 460
                ? 'Could not parse options or arguments, and too many errors to display in chat.'
                : message,
        );
    }

    return {
        options: parsedOptions.data,
        arguments: parsedArguments.data,
        parameters: {
            text: parameters.split.length === 0 ? null : parameters.split.join(' '),
            split: parameters.split,
            command: parameters.command,
        },
    };
}
