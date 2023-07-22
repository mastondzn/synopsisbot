import { type PrivmsgMessage } from '@kararty/dank-twitch-irc';
import { z } from 'zod';

import {
    type Database,
    type GlobalPermissionLevel,
    type LocalPermissionLevel,
    type Prisma,
} from '@synopsis/db';

export const localLevels = [
    'BROADCASTER',
    'AMBASSADOR',
    'MODERATOR',
    'VIP',
    'SUBSCRIBER',
    'NORMAL',
    'BANNED',
] as const satisfies readonly LocalPermissionLevel[];
export const localLevelSchema = z.enum(localLevels);

export const globalLevels = [
    'OWNER',
    'NORMAL',
    'BANNED',
] as const satisfies readonly GlobalPermissionLevel[];
export const globalLevelSchema = z.enum(globalLevels);

export const determineHighestLocalLevel = (
    ...levels: LocalPermissionLevel[]
): LocalPermissionLevel => {
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

export const determineHighestGlobalLevel = (
    ...levels: GlobalPermissionLevel[]
): GlobalPermissionLevel => {
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
export const pleasesLocal = (
    wantedLevel: LocalPermissionLevel,
    actualLevel: LocalPermissionLevel
): boolean => {
    return determineHighestLocalLevel(wantedLevel, actualLevel) === actualLevel;
};

/**
 * @param wantedLevel the level the user wants to have
 * @param actualLevel the level the user actually has
 * @returns wether or not the user has a high enough level
 */
export const pleasesGlobal = (
    wantedLevel: GlobalPermissionLevel,
    actualLevel: GlobalPermissionLevel
): boolean => {
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
    // private redis: Redis;
    private db: Database;

    constructor(db: Database) {
        this.db = db;
    }

    async getDbLocalPermission(
        channelId: string,
        userId: string
    ): Promise<LocalPermissionLevel | null> {
        const result = await this.db.localPermission.findFirst({
            where: {
                channelTwitchId: channelId,
                userTwitchId: userId,
            },
            select: {
                permission: true,
            },
        });

        return result?.permission ?? null;
    }

    private async getDbGlobalPermission(userId: string): Promise<GlobalPermissionLevel | null> {
        const result = await this.db.globalPermission.findFirst({
            where: { userTwitchId: userId },
            select: { permission: true },
        });

        return result?.permission ?? null;
    }

    async getGlobalPermission(userId: string): Promise<GlobalPermissionLevel> {
        const permission = (await this.getDbGlobalPermission(userId)) ?? 'NORMAL';
        return permission;
    }

    private getLocalPermissionFromMessage(msg: PrivmsgMessage): LocalPermissionLevel | null {
        const { isMod, channelName, senderUsername, badges } = msg;
        const isBroadcaster = channelName === senderUsername;
        const isVip = badges.hasVIP;

        if (isBroadcaster) return 'BROADCASTER';
        if (isMod) return 'MODERATOR';
        if (isVip) return 'VIP';
        return null;
    }

    async getLocalPermission(msg: PrivmsgMessage): Promise<LocalPermissionLevel> {
        const localFromMessage = this.getLocalPermissionFromMessage(msg);
        const localFromDatabase = await this.getDbLocalPermission(msg.channelID, msg.senderUserID);
        return localFromDatabase ?? localFromMessage ?? 'NORMAL';
    }

    async getPermission(msg: PrivmsgMessage): Promise<{
        local: LocalPermissionLevel;
        global: GlobalPermissionLevel;
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
        permission: LocalPermissionLevel,
        { channel, user }: PermissionContext
    ): Promise<void> {
        const existingDbPermission = await this.getDbLocalPermission(channel.id, user.id);
        if (existingDbPermission === permission) return;

        if (permission === 'NORMAL') {
            if (!existingDbPermission) return;

            await this.db.localPermission.delete({
                where: {
                    userTwitchId_channelTwitchId: {
                        channelTwitchId: channel.id,
                        userTwitchId: user.id,
                    },
                },
            });
            return;
        }

        const dbPermission: Prisma.LocalPermissionCreateInput = {
            channel: {
                connectOrCreate: {
                    where: { twitchId: channel.id },
                    create: { twitchId: channel.id, twitchLogin: channel.login },
                },
            },
            user: {
                connectOrCreate: {
                    where: { twitchId: user.id },
                    create: { twitchId: user.id, twitchLogin: user.login },
                },
            },
            permission,
        };

        if (!existingDbPermission) {
            await this.db.localPermission.create({ data: dbPermission });
            return;
        }

        await this.db.localPermission.update({
            where: {
                userTwitchId_channelTwitchId: {
                    channelTwitchId: channel.id,
                    userTwitchId: user.id,
                },
            },
            data: dbPermission,
        });
        return;
    }

    /**
     * @param permission the permission level we want to set
     * @param identifier the user id or the message object
     */
    async setGlobalPermission(permission: GlobalPermissionLevel, { user }: { user: User }) {
        const existingDbPermission = await this.getDbGlobalPermission(user.id);

        if (permission === 'NORMAL') {
            if (!existingDbPermission) return;
            await this.db.globalPermission.delete({
                where: { userTwitchId: user.id },
            });
            return;
        }

        const dbPermission: Prisma.GlobalPermissionCreateInput = {
            permission,
            user: {
                connectOrCreate: {
                    where: { twitchId: user.id },
                    create: { twitchId: user.id, twitchLogin: user.login },
                },
            },
        };

        if (!existingDbPermission) {
            await this.db.globalPermission.create({ data: dbPermission });
            return;
        }

        await this.db.globalPermission.update({
            data: dbPermission,
            where: { userTwitchId: user.id },
        });
        return;
    }

    async pleasesLocal(
        wantedPermission: LocalPermissionLevel,
        msg: PrivmsgMessage
    ): Promise<boolean> {
        const current = await this.getLocalPermission(msg);
        return pleasesLocal(wantedPermission, current);
    }

    async pleasesGlobal(wantedPermission: GlobalPermissionLevel, userId: string): Promise<boolean> {
        const current = await this.getGlobalPermission(userId);
        return pleasesGlobal(wantedPermission, current);
    }

    async pleasesGlobalAndLocal(
        wantedGlobalPermission: GlobalPermissionLevel,
        wantedLocalPermission: LocalPermissionLevel,
        msg: PrivmsgMessage
    ): Promise<boolean> {
        const [global, local] = await Promise.all([
            this.pleasesGlobal(wantedGlobalPermission, msg.senderUserID),
            this.pleasesLocal(wantedLocalPermission, msg),
        ]);

        return global && local;
    }

    async pleasesGlobalOrLocal(
        wantedGlobalPermission: GlobalPermissionLevel,
        wantedLocalPermission: LocalPermissionLevel,
        msg: PrivmsgMessage
    ): Promise<boolean> {
        const { global, local } = await this.getPermission(msg);

        if (
            (global === 'BANNED' && wantedGlobalPermission !== 'BANNED') ||
            (local === 'BANNED' && wantedLocalPermission !== 'BANNED')
        ) {
            return false;
        }

        return (
            pleasesGlobal(wantedGlobalPermission, global) ||
            pleasesLocal(wantedLocalPermission, local)
        );
    }
}
