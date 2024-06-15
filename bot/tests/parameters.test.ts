import { describe, expect, it } from 'vitest';
import { z } from 'zod';

import { parseParameters, parseParametersAndOptions } from '~/helpers/command/parameters';

describe('parseParameters', () => {
    it('should return null text if only the command was passed', () => {
        expect(parseParameters({ messageText: 'sb test' }).text).toBe(null);
    });

    it('should return the text if it was passed', () => {
        expect(parseParameters({ messageText: 'sb test test' }).text).toBe('test');
    });

    it('should return split params if they were passed', () => {
        const parameters = parseParameters({ messageText: 'sb test test1 test2' });
        expect(parameters.text).toBe('test1 test2');
        expect(parameters.split).toEqual(['test1', 'test2']);
    });

    it('should return the command name', () => {
        expect(parseParameters({ messageText: 'sb command' }).command).toBe('command');
    });
});

describe('parseParametersAndOptions', () => {
    it('should return empty options if no options were passed', async () => {
        const { options } = await parseParametersAndOptions({ messageText: 'sb test' }, {});
        expect(options).toEqual({});
    });

    it('should return the parameters', async () => {
        const { parameters } = await parseParametersAndOptions({ messageText: 'sb test' }, {});

        expect(parameters).toEqual({
            text: null,
            command: 'test',
            split: [],
        });
    });

    it('should return the options if they were passed', async () => {
        const command = {
            options: { key: { schema: z.string() } },
        };

        const { options } = await parseParametersAndOptions(
            { messageText: 'sb test key:value' },
            command,
        );

        expect(options).toEqual({ key: 'value' });
    });

    it('should work with multiple options', async () => {
        const command = {
            options: {
                key: { schema: z.string() },
                key2: { schema: z.string() },
            },
        };

        const { options } = await parseParametersAndOptions(
            { messageText: 'sb test key:value key2:value2' },
            command,
        );

        expect(options).toEqual({ key: 'value', key2: 'value2' });
    });

    it('should work with aliases', async () => {
        const command = {
            options: {
                key: { schema: z.string(), aliases: ['k'] },
            },
        };

        const { options } = await parseParametersAndOptions(
            { messageText: 'sb test k:value' },
            command,
        );

        expect(options).toEqual({ key: 'value' });
    });

    it('should work with zod features like transforms', async () => {
        const schema = z.string().transform((value) => value.toUpperCase());
        const schema2 = z.enum(['xd']);

        const command = {
            options: {
                key: { schema },
                key2: { schema: schema2 },
            },
        };

        const { options } = await parseParametersAndOptions(
            { messageText: 'sb test key:value key2:xd' },
            command,
        );

        expect(options).toEqual({ key: 'VALUE', key2: 'xd' });
    });

    it('should exclude parameters if they are wanted key:value options', async () => {
        const command = {
            options: {
                key: { schema: z.string() },
                key2: { schema: z.string() },
            },
        };

        const { parameters } = await parseParametersAndOptions(
            { messageText: 'sb foo key:value bar key2:value' },
            command,
        );

        expect(parameters).toEqual({
            text: 'bar',
            command: 'foo',
            split: ['bar'],
        });
    });

    it('should keep parameters if they are unwanted key:value options', async () => {
        const { parameters } = await parseParametersAndOptions(
            { messageText: 'sb test key:value' },
            { options: {} },
        );

        expect(parameters).toEqual({
            text: 'key:value',
            command: 'test',
            split: ['key:value'],
        });
    });

    it('should throw if the option is invalid', async () => {
        const command = {
            options: { key: { schema: z.literal('xd') } },
        };

        await expect(
            parseParametersAndOptions({ messageText: 'sb test key:123' }, command),
        ).rejects.toThrowError();
    });

    it('should only split a key:value once', async () => {
        const command = {
            options: { key: { schema: z.string() } },
        };

        const { options } = await parseParametersAndOptions(
            { messageText: 'sb test key:123:abc' },
            command,
        );

        expect(options).toEqual({
            key: '123:abc',
        });
    });
});
