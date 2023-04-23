export const pickOne = <T>(arr: T[]): T => {
    if (arr.length === 0) throw new Error('Cannot pick from an empty array.');
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return arr[Math.floor(Math.random() * arr.length)]!;
};
