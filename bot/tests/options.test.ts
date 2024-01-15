import { describe, expect, it } from 'vitest';
import { z } from 'zod';

import { parseOptions } from '~/helpers/command/options';

describe('parseOptions', () => {
    it('should parse correctly', () => {
        const parsed = parseOptions('bool:true bool2:false string:hello number:123 number2:12.21', {
            bool: z.boolean(),
            bool2: z.boolean(),
            string: z.string(),
            number: z.number(),
            number2: z.number(),
        });

        expect(parsed).toEqual({
            bool: true,
            bool2: false,
            string: 'hello',
            number: 123,
            number2: 12.21,
        });
    });

    it('should transform', () => {
        const parsed = parseOptions('bool:true', {
            bool: z.boolean().transform(value => !value),
        });

        expect(parsed).toEqual({
            bool: false,
        });
    });

    it('should parse optional', () => {
        const parsed = parseOptions('', {
            bool: z.boolean().optional(),
        });

        expect(parsed).toEqual({});
    });

    it('should parse default', () => {
        const foo = parseOptions('', {
            str: z.string().default('hello'),
        });

        expect(foo).toEqual({
            str: 'hello',
        });

        const bar = parseOptions('str:world', {
            str: z.string().default('hello'),
        });

        expect(bar).toEqual({
            str: 'world',
        });
    });
});
