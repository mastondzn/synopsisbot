import {
    determineHighestGlobalLevel,
    determineHighestLocalLevel,
    pleasesGlobal,
    pleasesLocal,
} from '~/utils/permissions';

describe('permissions', () => {
    it('should return the highest local level', () => {
        expect(determineHighestLocalLevel('NORMAL', 'MODERATOR')).toBe('MODERATOR');
    });

    it('should return the highest local level', () => {
        expect(determineHighestGlobalLevel('NORMAL', 'OWNER')).toBe('OWNER');
    });

    it('should return true if the user has a high enough local level', () => {
        expect(pleasesLocal('NORMAL', 'MODERATOR')).toBe(true);
        expect(pleasesLocal('NORMAL', 'NORMAL')).toBe(true);
    });

    it('should return true if the user has a high enough global level', () => {
        expect(pleasesGlobal('NORMAL', 'OWNER')).toBe(true);
        expect(pleasesGlobal('NORMAL', 'NORMAL')).toBe(true);
    });

    it('should return false if the user does not have a high enough local level', () => {
        expect(pleasesLocal('MODERATOR', 'NORMAL')).toBe(false);
        expect(pleasesLocal('NORMAL', 'BANNED')).toBe(false);
    });

    it('should return false if the user does not have a high enough global level', () => {
        expect(pleasesGlobal('OWNER', 'NORMAL')).toBe(false);
        expect(pleasesGlobal('NORMAL', 'BANNED')).toBe(false);
    });
});
