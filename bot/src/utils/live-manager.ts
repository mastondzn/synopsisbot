import type { ApiClient } from '@twurple/api';
import type { Redis } from 'ioredis';

export class LiveStatusManager {
    private api: ApiClient;
    private cache: Redis;
    private key = (channel: string) => `status:${channel}`;

    constructor(api: ApiClient, cache: Redis) {
        this.api = api;
        this.cache = cache;
    }

    public async isLive(channel: string): Promise<boolean> {
        const cached = await this.getCache(channel);
        if (cached !== null) {
            return cached;
        }

        const stream = await this.api.streams.getStreamByUserName(channel);
        if (!stream) {
            await this.setCache(channel, 'false');
            return false;
        }

        await this.setCache(channel, 'true');
        return true;
    }

    private async getCache(channel: string) {
        const cached = await this.cache.get(this.key(channel));
        if (cached === 'true') {
            return true;
        }
        if (cached === 'false') {
            return false;
        }
        return null;
    }

    private async setCache(channel: string, value: 'true' | 'false') {
        await this.cache.set(this.key(channel), value, 'EX', 60 * 5);
    }
}
