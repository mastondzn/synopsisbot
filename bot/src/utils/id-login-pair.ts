import type { ApiClient } from '@twurple/api/lib';
import type { Redis } from 'ioredis';

export class IdLoginPairProvider {
    redis: Redis;
    api: ApiClient;

    constructor(redis: Redis, api: ApiClient) {
        this.redis = redis;
        this.api = api;
    }

    private idKey(login: string): string {
        return `id:login:${login}`;
    }

    private loginKey(id: string): string {
        return `login:id:${id}`;
    }

    private async getLoginCache(id: string): Promise<string | null> {
        return await this.redis.get(this.loginKey(id));
    }

    private async getIdCache(login: string): Promise<string | null> {
        return await this.redis.get(this.idKey(login));
    }

    private async setLoginCache(id: string, login: string): Promise<void> {
        await this.redis.set(this.loginKey(id), login, 'EX', 15 * 60);
    }

    private async setIdCache(login: string, id: string): Promise<void> {
        await this.redis.set(this.idKey(login), id, 'EX', 15 * 60);
    }

    async getId(login: string): Promise<string | null> {
        const cached = await this.getIdCache(login);
        if (cached) {
            return cached;
        }

        const user = await this.api.users.getUserByName(login);
        if (user) {
            void this.setLoginCache(user.id, user.name);
            void this.setIdCache(user.name, user.id);
            return user.id;
        }

        return null;
    }

    async getLogin(id: string): Promise<string | null> {
        const cached = await this.getLoginCache(id);
        if (cached) {
            return cached;
        }

        const user = await this.api.users.getUserById(id);
        if (user) {
            void this.setLoginCache(user.id, user.name);
            void this.setIdCache(user.name, user.id);
            return user.name;
        }

        return null;
    }
}
