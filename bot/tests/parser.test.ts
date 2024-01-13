import { describe, expect, it } from 'vitest';

import { parseCommandParams } from '~/helpers/command';

describe('parseCommandParams', () => {
    it('should return null text if only the command was passed', () => {
        expect(parseCommandParams('sb test').text).toBe(null);
    });

    it('should return the text if it was passed', () => {
        expect(parseCommandParams('sb test test').text).toBe('test');
    });

    it('should return split params if they were passed', () => {
        const parameters = parseCommandParams('sb test test1 test2');
        expect(parameters.text).toBe('test1 test2');
        expect(parameters.list).toEqual(['test1', 'test2']);
    });

    it('should return the command name', () => {
        expect(parseCommandParams('sb command').command).toBe('command');
    });

    it('should throw if theres not enough params', () => {
        expect(() => parseCommandParams('sb')).toThrow();
    });
});
