/**
 * Chunks a string into multiple strings of a given size.
 * @param text The text to chunk
 * @param size The size of each chunk in characters
 */
export function chunkText(text: string, size: number): string[] {
    const words = text.split(/\s+/);

    const chunks: string[] = [];
    let currentChunk = '';

    for (const word of words) {
        if (currentChunk.length + word.length + 1 > size && currentChunk.length > 0) {
            chunks.push(currentChunk.trim());
            currentChunk = '';
        }

        currentChunk += (currentChunk.length > 0 ? ' ' : '') + word;
    }

    if (currentChunk.length > 0) {
        chunks.push(currentChunk.trim());
    }

    return chunks;
}
