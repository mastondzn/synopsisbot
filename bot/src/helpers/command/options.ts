import type { PrivmsgMessage } from '@kararty/dank-twitch-irc';
import { z } from 'zod';

import { splitOnce } from '../string';

const separator = ':';

export function parseOptions<TOptions extends z.ZodRawShape>(
    message: string | PrivmsgMessage,
    options?: TOptions,
): z.infer<z.ZodObject<TOptions>> {
    message = typeof message === 'string' ? message : message.messageText;
    const split = message.split(/\s+/);

    if (!options) {
        return {} as z.infer<z.ZodObject<TOptions>>;
    }

    const entries = Object.entries(options).reduce<
        [string, unknown][]
    >((accumulator, [key, schema]) => {
        const part = split.find(part => part.startsWith(`${key}${separator}`));
        if (!part) return accumulator;
        const [, value] = splitOnce(part, separator);
        if (typeof value !== 'string') return accumulator;

        const unwrappers = new Map<unknown, (argument: unknown) => unknown>([
            [z.ZodEffects, (schema: z.ZodEffects<z.ZodTypeAny>) => schema._def.schema],
            [z.ZodOptional, (schema: z.ZodOptional<z.ZodTypeAny>) => schema._def.innerType],
            [z.ZodDefault, (schema: z.ZodDefault<z.ZodTypeAny>) => schema._def.innerType],
        ] as [unknown, (argument: unknown) => unknown][]);

        const parsers = new Map([
            [z.ZodString, (argument: string) => argument],
            [z.ZodNumber, (argument: string) => Number.parseFloat(argument)],
            [z.ZodBoolean, (argument: string) => {
                if (['true', 'false'].includes(argument)) {
                    return argument === 'true';
                }
                throw new Error('Invalid boolean');
            }],
        ] as [unknown, (argument: string) => unknown][]);

        let tries = 0;
        const maxTries = 8;
        while (tries < maxTries) {
            for (const [unwrapper, unwrap] of unwrappers) {
                // @ts-expect-error too dank
                // eslint-disable-next-line ts/no-explicit-any
                if (schema instanceof unwrapper as any) {
                    // @ts-expect-error too dank
                    schema = unwrap(schema);
                }
            }

            for (const [parser, parse] of parsers) {
                // @ts-expect-error too dank
                // eslint-disable-next-line ts/no-explicit-any
                if (schema instanceof parser as any) {
                    accumulator.push([key, parse(value)]);
                    return accumulator;
                }
            }
            tries++;
        }

        throw new Error(`Failed to parse option ${part}`);
    }, []);

    return z.object(options).parse(Object.fromEntries(entries));
}
