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
            { arguments: [z.string()] },
        );

        expect(args).toEqual(['value']);
    });

    it('should work with multiple arguments', async () => {
        const { arguments: args } = await parseParameters(
            { messageText: 'sb test value value2' },
            { arguments: [z.string(), z.string()] },
        );

        expect(args).toEqual(['value', 'value2']);
    });

    it('should work with zod features like transforms', async () => {
        const { arguments: args } = await parseParameters(
            { messageText: 'sb test value' },
            // eslint-disable-next-line ts/require-await
            { arguments: [z.string().transform(async (value) => value.toUpperCase())] },
        );

        expect(args).toEqual(['VALUE']);
    });

    it('should work with both options and arguments', async () => {
        const { parameters, arguments: args } = await parseParameters(
            { messageText: 'sb foo key:value bar' },
            {
                options: { key: { schema: z.string() } },
                arguments: [z.string().transform((value) => value.toUpperCase())],
            },
        );

        expect(parameters).toEqual({
            text: 'bar',
            command: 'foo',
            split: ['bar'],
        });

        expect(args).toEqual(['BAR']);
    });
});
