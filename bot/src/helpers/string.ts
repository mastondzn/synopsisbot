export function splitOnce(string: string, separator: string): [string, string] | string {
    if (separator.length !== 1) {
        throw new Error('separator must be a single character');
    }

    const index = string.indexOf(separator);

    if (index === -1) {
        return string;
    };

    return [string.slice(0, index), string.slice(index + separator.length)];
};
