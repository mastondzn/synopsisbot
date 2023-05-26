export const pickOne = <T>(arr: T[]): T => {
    if (arr.length === 0) throw new Error('Cannot pick from an empty array.');
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return arr[Math.floor(Math.random() * arr.length)]!;
};

export const wait = (ms: number): Promise<void> =>
    new Promise((resolve) => setTimeout(resolve, ms));

export const shuffle = <T>(arr: T[]): T[] => {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        [arr[i], arr[j]] = [arr[j]!, arr[i]!];
    }
    return arr;
};
