/* eslint-disable unicorn/no-useless-undefined */
/* eslint-disable @typescript-eslint/no-empty-function */
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
