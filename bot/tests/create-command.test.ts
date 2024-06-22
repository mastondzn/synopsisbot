import { describe, expect, expectTypeOf, it } from 'vitest';
import { z } from 'zod';

import { createCommand } from '~/helpers/command/define';

describe('createCommand', () => {
    it('should return the same command', () => {
        const command = {
            name: 'test',
            description: 'test',
            options: {},
            run: () => {
                return { reply: 'foo' };
            },
        } as const;

        const created = createCommand(command);

        expect(created).toEqual(command);
    });

    it('should match the types of options in the run function', () => {
        const schema = z.string().transform(() => true);

        createCommand({
            name: 'test',
            description: 'test',
            options: {
                one: { schema },
                two: { schema: z.string() },
            },
            run: ({ options }) => {
                expectTypeOf(options).toMatchTypeOf<{
                    one: boolean;
                    two: string;
                }>();

                return { reply: 'foo' };
            },
        });
    });

    it('should match the types of arguments in the run function', () => {
        createCommand({
            name: 'test',
            description: 'test',
            arguments: [z.string().transform(() => true)],
            run: ({ args }) => {
                // we want the extra string tuple rest to be included
                expectTypeOf(args).toEqualTypeOf<[boolean, ...string[]]>();

                return { reply: 'foo' };
            },
        });
    });

    it('should match the types of options and arguments in the run function', () => {
        const schema = z.string().transform(() => true);

        createCommand({
            name: 'test',
            description: 'test',
            options: {
                one: { schema },
                two: { schema: z.string() },
            },
            arguments: [z.string().transform(() => true)],
            run: ({ options, args }) => {
                expectTypeOf(options).toMatchTypeOf<{
                    one: boolean;
                    two: string;
                }>();
                expectTypeOf(args).toEqualTypeOf<[boolean, ...string[]]>();

                return { reply: 'foo' };
            },
        });
    });

    it('should have desirable types if no options or arguments', () => {
        createCommand({
            name: 'test',
            description: 'test',
            run: ({ options, args }) => {
                expectTypeOf(options).toEqualTypeOf<Record<string, unknown>>();
                expectTypeOf(args).toEqualTypeOf<string[]>();

                return { reply: 'foo' };
            },
        });
    });
});
