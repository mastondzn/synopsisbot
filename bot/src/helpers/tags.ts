export function trim(strings: TemplateStringsArray, ...values: string[]): string {
    return strings
        .reduce((acc, str, index) => acc + str + (values[index] ?? ''), '')
        .replaceAll(/\s+/g, ' ')
        .trim();
}
