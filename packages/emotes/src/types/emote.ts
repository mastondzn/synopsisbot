export interface Emote {
    type: 'global' | 'channel';
    provider: string;
    id: string;
    name: string;
    alias?: string;
}
