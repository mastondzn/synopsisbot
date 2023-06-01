import { type EditableEmoteProvider, type EmoteProvider } from '../types/provider';
import { type Emote } from '~/types/emote';

export class SevenTVEmoteProvider implements EditableEmoteProvider {
    name = '7tv';

    getGlobalEmotes(): Promise<Emote[]> {
        throw new Error('Method not implemented.');
    }
    getChannelEmotes(id: string): Promise<Emote[]> {
        throw new Error('Method not implemented.');
    }
    addEmote(name: string): Promise<void> {
        throw new Error('Method not implemented.');
    }
    removeEmote(name: string): Promise<void> {
        throw new Error('Method not implemented.');
    }
}
