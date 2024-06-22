import { describe, expect, it } from 'vitest';

import { parseSimpleParameters } from '~/helpers/command/parameters';

describe('simplyParseParameters', () => {
    it('should return null text if only the command was passed', () => {
        expect(parseSimpleParameters({ messageText: 'sb test' }).text).toBe(null);
    });

    it('should return the text if it was passed', () => {
        expect(parseSimpleParameters({ messageText: 'sb test test' }).text).toBe('test');
    });

    it('should return split params if they were passed', () => {
        const parameters = parseSimpleParameters({ messageText: 'sb test test1 test2' });
        expect(parameters.text).toBe('test1 test2');
        expect(parameters.split).toEqual(['test1', 'test2']);
    });

    it('should return the command name', () => {
        expect(parseSimpleParameters({ messageText: 'sb command' }).command).toBe('command');
    });
});
