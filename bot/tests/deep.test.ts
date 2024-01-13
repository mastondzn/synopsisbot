/* eslint-disable unicorn/no-useless-undefined */
import { describe, expect, it } from 'vitest';

import { getPaths } from '~/helpers/command';

describe('getPaths', () => {
    it('should return a list of paths', () => {
        const paths = getPaths({
            abc: {
                def: () => undefined,
            },
            foo: {
                bar: () => undefined,
            },
        });

        expect(paths).toEqual([
            ['abc', 'def'],
            ['foo', 'bar'],
        ]);
    });
});
