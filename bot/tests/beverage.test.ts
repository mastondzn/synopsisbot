import { beverages, safeMultipliers, safePoints } from '~/data/beverages';

describe('beverages', () => {
    it('should always result in integers when multiplying safePoints with safeMultipliers', () => {
        for (const multiplier of safeMultipliers) {
            for (const point of safePoints) {
                const result = multiplier * point;
                expect(result).toBeCloseTo(Math.round(result));
            }
        }
    });

    it('sentences should always end with some punctuation', () => {
        for (const [, beverage] of beverages) {
            expect(beverage.message).toMatch(/.*[!.?]$/);

            if (beverage.modifiers?.length) {
                for (const modifier of beverage.modifiers) {
                    expect(modifier.message).toMatch(/.*[!.?]$/);
                }
            }
        }
    });
});
