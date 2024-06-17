/** Trims some lines for usage in twitch chat, strips newlines and extra spaces */
export function trim(strings: TemplateStringsArray, ...values: (string | number)[]): string {
    return strings
        .reduce((acc, str, index) => acc + str + (values[index] ?? ''), '')
        .replaceAll(/\s+/g, ' ')
        .trim();
}
