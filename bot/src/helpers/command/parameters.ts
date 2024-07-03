import type { PrivmsgMessage } from '@mastondzn/dank-twitch-irc';
import { mapValues } from 'remeda';
import { ZodFirstPartyTypeKind, z } from 'zod';
import { fromZodError } from 'zod-validation-error';

import { prefix } from './prefix';
import type { BasicCommand, ZodArgumentArray, ZodArgumentTuple, ZodArguments } from './types';
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
    const { options = {}, arguments: args } = command;

    const schemas = {
        options: z.object(mapValues(options, ({ schema }) => schema)),
        arguments: args ?? z.tuple([]),
    };

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

    const countToInclude = getArgumentCount(schemas.arguments, parameters.split);

    const [parsedOptions, parsedArguments] = await Promise.all([
        schemas.options.safeParseAsync(rawOptions),
        schemas.arguments.safeParseAsync(
            typeof countToInclude === 'number'
                ? parameters.split.slice(0, countToInclude)
                : parameters.split,
        ),
    ]);

    if (!parsedArguments.success || !parsedOptions.success) {
        const message = trim`
            Bad ${
                !parsedArguments.success && !parsedOptions.success
                    ? 'options and arguments'
                    : parsedArguments.success
                      ? 'options'
                      : 'arguments'
            }:
            ${
                (parsedArguments.error
                    ? fromZodError(parsedArguments.error, { prefix: null }).message
                    : '') +
                (parsedOptions.error
                    ? fromZodError(parsedOptions.error, { prefix: null }).message
                    : '')
            }.
        `;

        throw new UserError(
            message.length > 460
                ? 'Bad options or arguments, and too many errors to display in chat.'
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

function isArray(schema: ZodArguments): schema is ZodArgumentArray {
    return schema._def.typeName === ZodFirstPartyTypeKind.ZodArray;
}

function isTuple(schema: ZodArguments): schema is ZodArgumentTuple {
    return schema._def.typeName === ZodFirstPartyTypeKind.ZodTuple;
}

function getArgumentCount(schema: ZodArguments, parameters: string[]): number | null {
    if (isArray(schema)) {
        // null means include all (no split)
        return null;
    } else if (isTuple(schema)) {
        // null (include all) if it has rest
        return schema._def.rest ? null : schema._def.items.length;
    } else {
        // we need to loop through the members of the union to find a desirable length
        for (const tuple of schema._def.options) {
            if (parameters.length >= tuple.items.length) {
                // if it also has rest, we can include all
                if (tuple._def.rest) return null;
                return tuple.items.length;
            }
        }

        // if we reach this point, it means that the parameters are less than the minimum,
        // (this schema is bound to fail anyway atp)
        return schema._def.options[0]._def.items.length;
    }
}
