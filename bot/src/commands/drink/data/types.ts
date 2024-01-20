export interface Modifier {
    name: string;
    message: string;
    chance: number;
    multiplier: SafeMultiplier;
}

export interface Beverage {
    identifier: string;
    emoji: string;
    message: string;
    weight: number;
    points: SafePoint;
    modifiers?: Modifier[];
}

export const safeMultipliers = [
    2, 1.8, 1.6, 1.4, 1.2, 1, 0.8, 0.6, 0.4, 0.2, 0, -0.2, -0.4, -0.6, -0.8, -1,
] as const;

export const safePoints = [
    -10, -20, -30, -40, -50, -60, -70, -80, -90, -100, 0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100,
    110, 120, 130, 140, 150, 160, 170, 180, 190, 200, 300, 400, 500, 600, 700, 800, 900, 1000,
] as const;

export type SafeMultiplier = (typeof safeMultipliers)[number];
export type SafePoint = (typeof safePoints)[number];
