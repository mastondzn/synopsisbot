import type { ReadonlyCollection } from '@discordjs/collection';
import { Collection } from '@discordjs/collection';

export function difference<K, V>(
    left: ReadonlyCollection<K, V>,
    right: ReadonlyCollection<K, V>,
): ReadonlyCollection<K, V> {
    const difference = new Collection<K, V>();

    for (const [leftKey, leftValue] of left) {
        const rightValue = right.get(leftKey);
        if (!rightValue) {
            difference.set(leftKey, leftValue);
            continue;
        }

        if (rightValue !== leftValue) {
            difference.set(leftKey, leftValue);
        }
    }

    return difference;
}
