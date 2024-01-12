export interface EmotePosition {
    name: string
    position: number
    length: number
}

export function findEmotePositions(message: string, emotes: string[]): EmotePosition[] {
    const result: EmotePosition[] = [];

    const regex = /(?<=^|\s)((?:[a-z]+)+)(?=\s|$)/gi;

    let match: RegExpExecArray | null = null;
    while ((match = regex.exec(message))) {
        const emote = match[1];
        if (!emote) {
            throw new Error('No name found');
        }
        if (emotes.includes(emote)) {
            result.push({
                name: emote,
                position: message.slice(0, match.index).length,
                length: match[0].length,
            });
        }
    }

    return result;
}
