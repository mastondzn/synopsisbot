import { describe, expect, it } from 'vitest';
import { z } from 'zod';

import { parseParameters } from '~/helpers/command/parameters';

describe('parseParameters', () => {
    it('should return empty arguments if no arguments were passed', async () => {
        const { arguments: args } = await parseParameters({ messageText: 'sb test' }, {});
        expect(args).toEqual([]);
    });

    it('should return the arguments if they were passed', async () => {
        const { arguments: args } = await parseParameters(
            { messageText: 'sb test value' },
            { arguments: z.tuple([z.string()]) },
        );

        expect(args).toEqual(['value']);
    });

    it('should work with multiple arguments', async () => {
        const { arguments: args } = await parseParameters(
            { messageText: 'sb test value value2' },
            { arguments: z.tuple([z.string(), z.string()]) },
        );

        expect(args).toEqual(['value', 'value2']);
    });

    it('should work with zod features like transforms', async () => {
        const { arguments: args } = await parseParameters(
            { messageText: 'sb test value' },
            {
                arguments: z.tuple([
                    z.string().transform((value) => Promise.resolve(value.toUpperCase())),
                ]),
            },
        );

        expect(args).toEqual(['VALUE']);
    });

    it('should work with both options and arguments', async () => {
        const { parameters, arguments: args } = await parseParameters(
            { messageText: 'sb foo key:value bar' },
            {
                options: { key: { schema: z.string() } },
                arguments: z.tuple([z.string().transform((value) => value.toUpperCase())]),
            },
        );

        expect(parameters).toEqual({
            text: 'bar',
            command: 'foo',
            split: ['bar'],
        });

        expect(args).toEqual(['BAR']);
    });

    it('should work with rest arguments', async () => {
        const { arguments: args } = await parseParameters(
            { messageText: 'sb test value value2 value3' },
            { arguments: z.tuple([z.string()]).rest(z.string()) },
        );

        expect(args).toEqual(['value', 'value2', 'value3']);
    });

    it('should work with options and rest arguments', async () => {
        const { parameters, arguments: args } = await parseParameters(
            { messageText: 'sb foo key:value bar value value2' },
            {
                options: { key: { schema: z.string() } },
                arguments: z.tuple([z.string()]).rest(z.string()),
            },
        );

        expect(parameters).toEqual({
            text: 'bar value value2',
            command: 'foo',
            split: ['bar', 'value', 'value2'],
        });

        expect(args).toEqual(['bar', 'value', 'value2']);
    });

    it('should work with unions', async () => {
        const command = {
            arguments: z.union([z.tuple([z.string().ip()]), z.tuple([z.string().url()])]),
        };

        const { arguments: args } = await parseParameters(
            { messageText: 'sb test https://example.com' },
            command,
        );

        const { arguments: args2 } = await parseParameters(
            { messageText: 'sb test 192.168.1.1' },
            command,
        );

        expect(args).toEqual(['https://example.com']);
        expect(args2).toEqual(['192.168.1.1']);
    });

    it('should work with arrays', async () => {
        const { arguments: args } = await parseParameters(
            { messageText: 'sb test https://example.com 192.168.1.1 192.168.1.1' },
            { arguments: z.array(z.string().ip().or(z.string().url())) },
        );

        expect(args).toEqual(['https://example.com', '192.168.1.1', '192.168.1.1']);
    });
});
