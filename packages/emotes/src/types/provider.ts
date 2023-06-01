import { type Emote } from './emote';

export interface EmoteProvider {
    name: string;

    getGlobalEmotes(): Promise<Emote[]>;
    getChannelEmotes(id: string): Promise<Emote[]>;
}

export interface EditableEmoteProvider extends EmoteProvider {
    addEmote(name: string): Promise<void>;
    removeEmote(name: string): Promise<void>;
}
