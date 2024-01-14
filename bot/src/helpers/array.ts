/* eslint-disable ts/no-non-null-assertion */

export function pickOne<T>(array: T[]): T {
    if (array.length === 0) throw new Error('Cannot pick from an empty array.');
    return array.at(Math.random() * array.length)!;
}

export function shuffle<T>(array: T[]): T[] {
    for (let left = array.length - 1; left > 0; left--) {
        const right = Math.floor(Math.random() * (left + 1));
        [array[left], array[right]] = [array[right]!, array[left]!];
    }
    return array;
}
