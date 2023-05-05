import { parseCommandParams } from '~/helpers/command';

describe('parseCommandParams', () => {
    it('should return null text if only the command was passed', () => {
        expect(parseCommandParams('sb test').text).toBe(null);
    });

    it('should return the text if it was passed', () => {
        expect(parseCommandParams('sb test test').text).toBe('test');
    });

    it('should return split params if they were passed', () => {
        const params = parseCommandParams('sb test test1 test2');
        expect(params.text).toBe('test1 test2');
        expect(params.list).toEqual(['test1', 'test2']);
    });

    it('should return the command name', () => {
        expect(parseCommandParams('sb command').command).toBe('command');
    });
});
