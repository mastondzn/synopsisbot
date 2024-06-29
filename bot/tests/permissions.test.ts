import { describe, expect, it } from 'vitest';

import {
    determineHighestGlobalLevel,
    determineHighestLocalLevel,
    satisfies,
} from '~/providers/permissions';

describe('permissions', () => {
    it('should return the highest local level', () => {
        expect(determineHighestLocalLevel('normal', 'moderator')).toBe('moderator');
        expect(determineHighestGlobalLevel('normal', 'owner')).toBe('owner');
    });

    it('should return true if the user has a high enough local level', () => {
        expect(
            satisfies.local({
                required: 'normal',
                current: 'moderator',
            }),
        ).toBe(true);
        expect(
            satisfies.local({
                required: 'normal',
                current: 'normal',
            }),
        ).toBe(true);
    });

    it('should return true if the user has a high enough global level', () => {
        expect(satisfies.global({ required: 'normal', current: 'owner' })).toBe(true);
        expect(satisfies.global({ required: 'normal', current: 'normal' })).toBe(true);
    });

    it('should return false if the user does not have a high enough local level', () => {
        expect(
            satisfies.local({
                required: 'moderator',
                current: 'normal',
            }),
        ).toBe(false);
        expect(
            satisfies.local({
                required: 'normal',
                current: 'banned',
            }),
        ).toBe(false);
    });

    it('should return false if the user does not have a high enough global level', () => {
        expect(satisfies.global({ required: 'owner', current: 'normal' })).toBe(false);
        expect(satisfies.global({ required: 'normal', current: 'banned' })).toBe(false);
    });
});
