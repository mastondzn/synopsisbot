/* eslint-disable unicorn/consistent-function-scoping */
import { describe, expectTypeOf, it } from 'vitest';
import { z } from 'zod';

import { zfetch } from '~/helpers/fetch';

describe('zfetch', () => {
    it('should match types', () => {
        const usage = async () => {
            return await zfetch({
                url: 'https://example.com',
                schema: z.object({
                    foo: z.string(),
                }),
            });
        };

        expectTypeOf(usage).toEqualTypeOf<
            () => Promise<{
                response: Response;
                body: {
                    foo: string;
                };
            }>
        >();
    });
});
