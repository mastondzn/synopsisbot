import type { PrivmsgMessage } from '@kararty/dank-twitch-irc';
import {
    type NewGlobalPermission,
    type NewLocalPermission,
    and,
    eq,
    globalPermissions as globalPermissionsTable,
    localPermissions as localPermissionsTable,
} from '@synopsis/db';
import { z } from 'zod';

import { db } from '../services/database';

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

export function determineHighestLocalLevel(...levels: LocalLevel[]): LocalLevel {
    let highestIndex: number | null = null;
    for (const level of levels) {
        const index = localLevels.indexOf(level);
        if (index === -1) {
            throw new Error('Invalid local permission level.');
        }
        if (highestIndex === null || index < highestIndex) {
            highestIndex = index;
        }
    }
    if (highestIndex === null) {
        throw new Error('No local permission levels provided.');
    }

    const level = localLevels[highestIndex];
    if (!level) {
        throw new Error('Invalid local permission level.');
    }
    return level;
}

export function determineHighestGlobalLevel(...levels: GlobalLevel[]): GlobalLevel {
    let highestIndex: number | null = null;
    for (const level of levels) {
        const index = globalLevels.indexOf(level);
        if (index === -1) {
            throw new Error('Invalid local permission level.');
        }
        if (highestIndex === null || index < highestIndex) {
            highestIndex = index;
        }
    }

    if (highestIndex === null) {
        throw new Error('No local permission levels provided.');
    }

    const level = globalLevels[highestIndex];
    if (!level) {
        throw new Error('Invalid local permission level.');
    }
    return level;
}

/**
 * @param wantedLevel The level the user wants to have
 * @param actualLevel The level the user actually has
 * @returns wether or not the user has a high enough level
 */
export function pleasesLocal(wantedLevel: LocalLevel, actualLevel: LocalLevel): boolean {
    return determineHighestLocalLevel(wantedLevel, actualLevel) === actualLevel;
}

/**
 * @param wantedLevel the level the user wants to have
 * @param actualLevel the level the user actually has
 * @returns wether or not the user has a high enough level
 */
export function pleasesGlobal(wantedLevel: GlobalLevel, actualLevel: GlobalLevel): boolean {
    return determineHighestGlobalLevel(wantedLevel, actualLevel) === actualLevel;
}

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

class PermissionsService {
    async getDbLocalPermission(
        channelId: string,
        userId: string,
    ): Promise<LocalLevelFromDatabase | null> {
        const [result] = await db
            .select({
                permission: localPermissionsTable.permission,
            })
            .from(localPermissionsTable)
            .where(
                and(
                    eq(localPermissionsTable.channelId, channelId),
                    eq(localPermissionsTable.userId, userId),
                ),
            )
            .limit(1);

        return result?.permission ?? null;
    }

    private async getDbGlobalPermission(userId: string): Promise<GlobalLevelFromDatabase | null> {
        const [result] = await db
            .select({
                permission: globalPermissionsTable.permission,
            })
            .from(globalPermissionsTable)
            .where(eq(globalPermissionsTable.userId, userId))
            .limit(1);

        return result?.permission ?? null;
    }

    async getGlobalPermission(userId: string): Promise<GlobalLevel> {
        const permission = (await this.getDbGlobalPermission(userId)) ?? 'normal';
        return permission;
    }

    private getLocalPermissionFromMessage(message: PrivmsgMessage): LocalLevelFromMessage | null {
        const { isMod, channelName, senderUsername, badges } = message;
        const isBroadcaster = channelName === senderUsername;
        const isVip = badges.hasVIP;

        if (isBroadcaster) {
            return 'broadcaster';
        }
        if (isMod) {
            return 'moderator';
        }
        if (isVip) {
            return 'vip';
        }
        return null;
    }

    async getLocalPermission(message: PrivmsgMessage): Promise<LocalLevel> {
        const localFromMessage = this.getLocalPermissionFromMessage(message);
        const localFromDatabase = await this.getDbLocalPermission(
            message.channelID,
            message.senderUserID,
        );
        if (localFromDatabase === 'banned') {
            return 'banned';
        }

        const permission =
            localFromDatabase && localFromMessage
                ? determineHighestLocalLevel(localFromDatabase, localFromMessage)
                : localFromDatabase ?? localFromMessage ?? 'normal';
        return permission;
    }

    async getPermission(message: PrivmsgMessage): Promise<{
        local: LocalLevel;
        global: GlobalLevel;
    }> {
        const [local, global] = await Promise.all([
            this.getLocalPermission(message),
            this.getGlobalPermission(message.senderUserID),
        ]);

        return { local, global };
    }

    async setLocalPermission(
        permission: LocalLevelFromDatabase | 'normal',
        { channel, user }: PermissionContext,
    ): Promise<void> {
        const existingDatabasePermission = await this.getDbLocalPermission(channel.id, user.id);
        if (existingDatabasePermission === permission) {
            return;
        }

        if (permission === 'normal') {
            if (!existingDatabasePermission) {
                return;
            }
            await db
                .delete(localPermissionsTable)
                .where(
                    and(
                        eq(localPermissionsTable.channelId, channel.id),
                        eq(localPermissionsTable.userId, user.id),
                    ),
                );

            return;
        }

        const databasePermission: NewLocalPermission = {
            channelLogin: channel.login,
            channelId: channel.id,
            userId: user.id,
            userLogin: user.login,
            permission,
        };

        if (!existingDatabasePermission) {
            await db.insert(localPermissionsTable).values(databasePermission);
            return;
        }

        await db
            .update(localPermissionsTable)
            .set(databasePermission)
            .where(
                and(
                    eq(localPermissionsTable.channelId, channel.id),
                    eq(localPermissionsTable.userId, user.id),
                ),
            );
    }

    async setGlobalPermission(permission: GlobalLevel, { user }: { user: User }) {
        const existingDatabasePermission = await this.getDbGlobalPermission(user.id);

        if (permission === 'normal') {
            if (!existingDatabasePermission) {
                return;
            }
            await db
                .delete(globalPermissionsTable)
                .where(eq(globalPermissionsTable.userId, user.id));
            return;
        }

        const databasePermission: NewGlobalPermission = {
            permission,
            userId: user.id,
            userLogin: user.login,
        };

        if (!existingDatabasePermission) {
            await db.insert(globalPermissionsTable).values(databasePermission);
            return;
        }

        await db
            .update(globalPermissionsTable)
            .set(databasePermission)
            .where(eq(globalPermissionsTable.userId, user.id));
    }

    async pleasesLocal(wantedPermission: LocalLevel, message: PrivmsgMessage): Promise<boolean> {
        const current = await this.getLocalPermission(message);
        return pleasesLocal(wantedPermission, current);
    }

    async pleasesGlobal(wantedPermission: GlobalLevel, userId: string): Promise<boolean> {
        const current = await this.getGlobalPermission(userId);
        return pleasesGlobal(wantedPermission, current);
    }

    async pleasesGlobalAndLocal(
        wantedGlobalPermission: GlobalLevel,
        wantedLocalPermission: LocalLevel,
        message: PrivmsgMessage,
    ): Promise<boolean> {
        const [global, local] = await Promise.all([
            this.pleasesGlobal(wantedGlobalPermission, message.senderUserID),
            this.pleasesLocal(wantedLocalPermission, message),
        ]);

        return global && local;
    }

    async pleasesGlobalOrLocal(
        wantedGlobalPermission: GlobalLevel,
        wantedLocalPermission: LocalLevel,
        message: PrivmsgMessage,
    ): Promise<boolean> {
        const { global, local } = await this.getPermission(message);

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

export const permissions = new PermissionsService();
