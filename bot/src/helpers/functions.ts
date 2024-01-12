export function pickOne<T>(array: T[]): T {
    if (array.length === 0) { throw new Error('Cannot pick from an empty array.'); }
    return array[Math.floor(Math.random() * array.length)]!;
}

export function wait(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export function shuffle<T>(array: T[]): T[] {
    for (let index = array.length - 1; index > 0; index--) {
        const index_ = Math.floor(Math.random() * (index + 1));
        [array[index], array[index_]] = [array[index_]!, array[index]!];
    }
    return array;
}
