import { type PrivmsgMessage } from '@kararty/dank-twitch-irc';
import { type Redis } from 'ioredis';
import { z } from 'zod';

import {
    and,
    eq,
    globalPermissions as globalPermissionsTable,
    localPermissions as localPermissionsTable,
    type NewGlobalPermission,
    type NewLocalPermission,
    type NodePgDatabase,
} from '@synopsis/db';

import { type IdLoginPairProvider } from './id-login-pair';

export const localLevels = [
    'broadcaster',
    'ambassador',
    'moderator',
    'vip',
    'normal',
    'banned',
] as const;
export const localLevelsFromMessage = ['broadcaster', 'moderator', 'vip'] as const;
export const localLevelsFromDatabase = ['banned', 'ambassador'] as const;
export const localLevelSchema = z.enum(localLevels);

export type LocalLevelFromMessage = (typeof localLevelsFromMessage)[number];
export type LocalLevelFromDatabase = (typeof localLevelsFromDatabase)[number];
export type LocalLevel = (typeof localLevels)[number];

export const globalLevelsFromDatabase = ['banned', 'owner'] as const;
export const globalLevels = ['owner', 'normal', 'banned'] as const;
export const globalLevelSchema = z.enum(globalLevels);

export type GlobalLevelFromDatabase = (typeof globalLevelsFromDatabase)[number];
export type GlobalLevel = (typeof globalLevels)[number];

export const determineHighestLocalLevel = (...levels: LocalLevel[]): LocalLevel => {
    let highestIndex: number | null = null;
    for (const level of levels) {
        const index = localLevels.indexOf(level);
        if (index === -1) throw new Error('Invalid local permission level.');
        if (highestIndex === null || index < highestIndex) highestIndex = index;
    }
    if (highestIndex === null) throw new Error('No local permission levels provided.');

    const level = localLevels[highestIndex];
    if (!level) throw new Error('Invalid local permission level.');
    return level;
};

export const determineHighestGlobalLevel = (...levels: GlobalLevel[]): GlobalLevel => {
    let highestIndex: number | null = null;
    for (const level of levels) {
        const index = globalLevels.indexOf(level);
        if (index === -1) throw new Error('Invalid local permission level.');
        if (highestIndex === null || index < highestIndex) highestIndex = index;
    }

    if (highestIndex === null) throw new Error('No local permission levels provided.');

    const level = globalLevels[highestIndex];
    if (!level) throw new Error('Invalid local permission level.');
    return level;
};

/**
 * @param wantedLevel The level the user wants to have
 * @param actualLevel The level the user actually has
 * @returns wether or not the user has a high enough level
 */
export const pleasesLocal = (wantedLevel: LocalLevel, actualLevel: LocalLevel): boolean => {
    return determineHighestLocalLevel(wantedLevel, actualLevel) === actualLevel;
};

/**
 * @param wantedLevel the level the user wants to have
 * @param actualLevel the level the user actually has
 * @returns wether or not the user has a high enough level
 */
export const pleasesGlobal = (wantedLevel: GlobalLevel, actualLevel: GlobalLevel): boolean => {
    return determineHighestGlobalLevel(wantedLevel, actualLevel) === actualLevel;
};

export class PermissionProvider {
    private redis: Redis;
    private db: NodePgDatabase;
    private idLoginPairs: IdLoginPairProvider;

    constructor(redis: Redis, db: NodePgDatabase, idLoginPair: IdLoginPairProvider) {
        this.redis = redis;
        this.db = db;
        this.idLoginPairs = idLoginPair;
    }

    private localKey(channelId: string, userId: string): string {
        return `perm:local:${channelId}:${userId}`;
    }

    private globalKey(userId: string): string {
        return `perm:global:${userId}`;
    }

    private async getCacheLocal(channelId: string, userId: string) {
        const cacheResult = await this.redis.get(this.localKey(channelId, userId));
        const validated = localLevelSchema.safeParse(cacheResult);

        if (!validated.success) return null;
        return validated.data;
    }

    private async getCacheGlobal(userId: string) {
        const cacheResult = await this.redis.get(this.globalKey(userId));
        const validated = globalLevelSchema.safeParse(cacheResult);

        if (!validated.success) return null;
        return validated.data;
    }

    private async setCacheLocal(channelId: string, userId: string, level: LocalLevel) {
        await this.redis.set(this.localKey(channelId, userId), level, 'EX', 10 * 60);
    }

    private async setCacheGlobal(userId: string, level: GlobalLevel) {
        await this.redis.set(this.globalKey(userId), level, 'EX', 10 * 60);
    }

    private async getDbLocalPermission(
        channelId: string,
        userId: string
    ): Promise<LocalLevelFromDatabase | null> {
        const [result] = await this.db
            .select({
                permission: localPermissionsTable.permission,
            })
            .from(localPermissionsTable)
            .where(
                and(
                    eq(localPermissionsTable.channelId, channelId),
                    eq(localPermissionsTable.userId, userId)
                )
            )
            .limit(1);

        return result?.permission ?? null;
    }

    private async getDbGlobalPermission(userId: string): Promise<GlobalLevelFromDatabase | null> {
        const [result] = await this.db
            .select({
                permission: globalPermissionsTable.permission,
            })
            .from(globalPermissionsTable)
            .where(eq(globalPermissionsTable.userId, userId))
            .limit(1);

        return result?.permission ?? null;
    }

    async getGlobalPermission(userId: string, skipCache?: boolean): Promise<GlobalLevel> {
        if (!skipCache) {
            const cached = await this.getCacheGlobal(userId);
            if (cached) return cached;
        }

        const permission = (await this.getDbGlobalPermission(userId)) ?? 'normal';
        void this.setCacheGlobal(userId, permission);
        return permission;
    }

    private getLocalPermissionFromMessage(msg: PrivmsgMessage): LocalLevelFromMessage | null {
        const { isMod, channelName, senderUsername, badges } = msg;
        const isBroadcaster = channelName === senderUsername;
        const isVip = badges.hasVIP;

        if (isBroadcaster) return 'broadcaster';
        if (isMod) return 'moderator';
        if (isVip) return 'vip';
        return null;
    }

    async getLocalPermission(msg: PrivmsgMessage, skipCache?: boolean): Promise<LocalLevel> {
        if (!skipCache) {
            const cached = await this.getCacheLocal(msg.channelID, msg.senderUserID);
            if (cached) return cached;
        }

        const localFromMessage = this.getLocalPermissionFromMessage(msg);
        const localFromDatabase = await this.getDbLocalPermission(msg.channelID, msg.senderUserID);

        const permission =
            localFromDatabase && localFromMessage
                ? determineHighestLocalLevel(localFromDatabase, localFromMessage)
                : localFromDatabase ?? localFromMessage ?? 'normal';
        void this.setCacheLocal(msg.channelID, msg.senderUserID, permission);
        return permission;
    }

    async getPermission(msg: PrivmsgMessage): Promise<{
        local: LocalLevel;
        global: GlobalLevel;
    }> {
        const [local, global] = await Promise.all([
            this.getLocalPermission(msg),
            this.getGlobalPermission(msg.senderUserID),
        ]);

        return { local, global };
    }

    async setLocalPermission(
        permission: LocalLevelFromDatabase,
        msg: PrivmsgMessage
    ): Promise<void> {
        const channel = {
            id: msg.channelID,
            login: msg.channelName,
        };

        const user = {
            id: msg.senderUserID,
            login: msg.senderUsername,
        };

        const dbPermission: NewLocalPermission = {
            channelLogin: channel.login,
            channelId: channel.id,
            userId: user.id,
            userLogin: user.login,
            permission,
        };

        const existingDbPermission = await this.getDbLocalPermission(channel.id, user.id);

        if (!existingDbPermission) {
            await this.db.insert(localPermissionsTable).values(dbPermission);
            return;
        }

        await this.db
            .update(localPermissionsTable)
            .set(dbPermission)
            .where(
                and(
                    eq(localPermissionsTable.channelId, channel.id),
                    eq(localPermissionsTable.userId, user.id)
                )
            );

        await this.setCacheLocal(channel.id, user.id, permission);
        return;
    }

    /**
     * @param permission the permission level we want to set
     * @param identifier the user id or the message object
     */
    async setGlobalPermission(permission: GlobalLevel, identifier: PrivmsgMessage | string) {
        const userId = typeof identifier === 'string' ? identifier : identifier.senderUserID;
        const userLogin =
            typeof identifier === 'string'
                ? await this.idLoginPairs.getLogin(identifier)
                : identifier.senderUsername;

        if (!userLogin) throw new Error('User login could not be determined');

        const existingDbPermission = await this.getDbGlobalPermission(userId);

        if (permission === 'normal') {
            if (!existingDbPermission) return;
            await Promise.all([
                this.db
                    .delete(globalPermissionsTable)
                    .where(eq(globalPermissionsTable.userId, userId)),
                this.redis.del(this.globalKey(userId)),
            ]);
            return;
        }

        const dbPermission: NewGlobalPermission = {
            permission,
            userId,
            userLogin,
        };

        if (!existingDbPermission) {
            await Promise.all([
                this.db.insert(globalPermissionsTable).values(dbPermission),
                this.setCacheGlobal(userId, permission),
            ]);

            return;
        }

        await Promise.all([
            this.db
                .update(globalPermissionsTable)
                .set(dbPermission)
                .where(eq(globalPermissionsTable.userId, userId)),
            this.setCacheGlobal(userId, permission),
        ]);

        return;
    }

    async pleasesLocal(wantedPermission: LocalLevel, msg: PrivmsgMessage): Promise<boolean> {
        const current = await this.getLocalPermission(msg);
        return pleasesLocal(wantedPermission, current);
    }

    async pleasesGlobal(wantedPermission: GlobalLevel, userId: string): Promise<boolean> {
        const current = await this.getGlobalPermission(userId);
        return pleasesGlobal(wantedPermission, current);
    }

    async pleasesGlobalAndLocal(
        wantedGlobalPermission: GlobalLevel,
        wantedLocalPermission: LocalLevel,
        msg: PrivmsgMessage
    ): Promise<boolean> {
        const [global, local] = await Promise.all([
            this.pleasesGlobal(wantedGlobalPermission, msg.senderUserID),
            this.pleasesLocal(wantedLocalPermission, msg),
        ]);

        return global && local;
    }

    async pleasesGlobalOrLocal(
        wantedGlobalPermission: GlobalLevel,
        wantedLocalPermission: LocalLevel,
        msg: PrivmsgMessage
    ): Promise<boolean> {
        const [global, local] = await Promise.all([
            this.pleasesGlobal(wantedGlobalPermission, msg.senderUserID),
            this.pleasesLocal(wantedLocalPermission, msg),
        ]);

        return global || local;
    }
}
