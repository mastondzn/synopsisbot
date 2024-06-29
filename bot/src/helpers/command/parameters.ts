import type { PrivmsgMessage } from '@mastondzn/dank-twitch-irc';
import { mapValues } from 'remeda';
import { z } from 'zod';
import { fromZodError } from 'zod-validation-error';

import { prefix } from './prefix';
import type { BasicCommand } from './types';
import { splitOnce } from '../string';
import { trim } from '../tags';
import { UserError } from '~/errors/user';

export function getWantedCommand({ messageText }: Pick<PrivmsgMessage, 'messageText'>) {
    return splitOnce(messageText.replace(prefix, ''), ' ')[0];
}

export interface CommandParameters {
    text: string | null;
    /** This can be the command alias, which is why its useful */
    command: string;
    split: string[];
}

export function parseSimpleParameters({
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

    const parameters = parseSimpleParameters(message);
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

    // @ts-expect-error this is just too hard to solve and not worth the hassle, it works
    const argumentsSchema = z.tuple(args).rest(z.string());
    const optionsSchema = z.object(mapValues(options, ({ schema }) => schema));

    // if there are no arguments, we can skip the parsing
    const argumentsPromise: ReturnType<typeof argumentsSchema.safeParseAsync> =
        args.length === 0
            ? Promise.resolve({ data: parameters.split, success: true })
            : argumentsSchema.safeParseAsync(parameters.split);

    const [parsedArguments, parsedOptions] = await Promise.all([
        argumentsPromise,
        optionsSchema.safeParseAsync(rawOptions),
    ]);

    if (!parsedArguments.success || !parsedOptions.success) {
        const message = trim`
            Could not parse ${
                !parsedArguments.success && !parsedOptions.success
                    ? 'options and arguments'
                    : parsedArguments.success
                      ? 'options'
                      : 'arguments'
            }:
            ${parsedArguments.error ? fromZodError(parsedArguments.error, { prefix: null }).message : ''}
            ${parsedOptions.error ? fromZodError(parsedOptions.error, { prefix: null }).message : ''}
        `;

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
