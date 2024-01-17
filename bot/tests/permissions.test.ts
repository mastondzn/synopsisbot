import { describe, expect, it } from 'vitest';

import {
    determineHighestGlobalLevel,
    determineHighestLocalLevel,
    pleasesGlobal,
    pleasesLocal,
} from '~/providers/permissions';

describe('permissions', () => {
    it('should return the highest local level', () => {
        expect(determineHighestLocalLevel('normal', 'moderator')).toBe('moderator');
        expect(determineHighestGlobalLevel('normal', 'owner')).toBe('owner');
    });

    it('should return true if the user has a high enough local level', () => {
        expect(pleasesLocal('normal', 'moderator')).toBe(true);
        expect(pleasesLocal('normal', 'normal')).toBe(true);
    });

    it('should return true if the user has a high enough global level', () => {
        expect(pleasesGlobal('normal', 'owner')).toBe(true);
        expect(pleasesGlobal('normal', 'normal')).toBe(true);
    });

    it('should return false if the user does not have a high enough local level', () => {
        expect(pleasesLocal('moderator', 'normal')).toBe(false);
        expect(pleasesLocal('normal', 'banned')).toBe(false);
    });

    it('should return false if the user does not have a high enough global level', () => {
        expect(pleasesGlobal('owner', 'normal')).toBe(false);
        expect(pleasesGlobal('normal', 'banned')).toBe(false);
    });
});
