import { type PrivmsgMessage } from '@kararty/dank-twitch-irc';
import { type Redis } from 'ioredis';
import { z } from 'zod';

import {
    and,
    type Database,
    eq,
    globalPermissions as globalPermissionsTable,
    localPermissions as localPermissionsTable,
    type NewGlobalPermission,
    type NewLocalPermission,
} from '@synopsis/db';

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

interface User {
    id: string;
    login: string;
}

interface Channel {
    id: string;
    login: string;
}

export interface PermissionContext {
    user: User;
    channel: Channel;
}

export class PermissionProvider {
    private redis: Redis;
    private db: Database;

    constructor(redis: Redis, db: Database) {
        this.redis = redis;
        this.db = db;
    }

    private localKey(channelId: string, userId: string): string {
        return `perm:local:${channelId}:${userId}`;
    }

    private globalKey(userId: string): string {
        return `perm:global:${userId}`;
    }

    private async getCacheGlobal(userId: string) {
        const cacheResult = await this.redis.get(this.globalKey(userId));
        const validated = globalLevelSchema.safeParse(cacheResult);

        if (!validated.success) return null;
        return validated.data;
    }

    private async setCacheGlobal(userId: string, level: GlobalLevel) {
        await this.redis.set(this.globalKey(userId), level, 'EX', 10 * 60);
    }

    async getDbLocalPermission(
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

    async getLocalPermission(msg: PrivmsgMessage): Promise<LocalLevel> {
        const localFromMessage = this.getLocalPermissionFromMessage(msg);
        const localFromDatabase = await this.getDbLocalPermission(msg.channelID, msg.senderUserID);
        if (localFromDatabase === 'banned') return 'banned';

        const permission =
            localFromDatabase && localFromMessage
                ? determineHighestLocalLevel(localFromDatabase, localFromMessage)
                : localFromDatabase ?? localFromMessage ?? 'normal';
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

    /**
     *
     * @param permission the permission to set
     * @param identifier the message that triggered the permission change
     * @returns
     */
    async setLocalPermission(
        permission: LocalLevelFromDatabase | 'normal',
        { channel, user }: PermissionContext
    ): Promise<void> {
        const existingDbPermission = await this.getDbLocalPermission(channel.id, user.id);
        if (existingDbPermission === permission) return;

        if (permission === 'normal') {
            if (!existingDbPermission) return;
            await Promise.all([
                this.db
                    .delete(localPermissionsTable)
                    .where(
                        and(
                            eq(localPermissionsTable.channelId, channel.id),
                            eq(localPermissionsTable.userId, user.id)
                        )
                    ),
                this.redis.del(this.localKey(channel.id, user.id)),
            ]);
            return;
        }

        const dbPermission: NewLocalPermission = {
            channelLogin: channel.login,
            channelId: channel.id,
            userId: user.id,
            userLogin: user.login,
            permission,
        };

        if (!existingDbPermission) {
            await Promise.all([this.db.insert(localPermissionsTable).values(dbPermission)]);
            return;
        }

        await Promise.all([
            this.db
                .update(localPermissionsTable)
                .set(dbPermission)
                .where(
                    and(
                        eq(localPermissionsTable.channelId, channel.id),
                        eq(localPermissionsTable.userId, user.id)
                    )
                ),
        ]);
        return;
    }

    /**
     * @param permission the permission level we want to set
     * @param identifier the user id or the message object
     */
    async setGlobalPermission(permission: GlobalLevel, { user }: { user: User }) {
        const existingDbPermission = await this.getDbGlobalPermission(user.id);

        if (permission === 'normal') {
            if (!existingDbPermission) return;
            await Promise.all([
                this.db
                    .delete(globalPermissionsTable)
                    .where(eq(globalPermissionsTable.userId, user.id)),
                this.setCacheGlobal(user.id, permission),
            ]);
            return;
        }

        const dbPermission: NewGlobalPermission = {
            permission,
            userId: user.id,
            userLogin: user.login,
        };

        if (!existingDbPermission) {
            await Promise.all([
                this.db.insert(globalPermissionsTable).values(dbPermission),
                this.setCacheGlobal(user.id, permission),
            ]);

            return;
        }

        await Promise.all([
            this.db
                .update(globalPermissionsTable)
                .set(dbPermission)
                .where(eq(globalPermissionsTable.userId, user.id)),
            this.setCacheGlobal(user.id, permission),
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
        const { global, local } = await this.getPermission(msg);

        if (
            (global === 'banned' && wantedGlobalPermission !== 'banned') ||
            (local === 'banned' && wantedLocalPermission !== 'banned')
        ) {
            return false;
        }

        return (
            pleasesGlobal(wantedGlobalPermission, global) ||
            pleasesLocal(wantedLocalPermission, local)
        );
    }
}
