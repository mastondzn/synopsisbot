import type { PrivmsgMessage } from '@mastondzn/dank-twitch-irc';
import { type NewGlobalPermission, type NewLocalPermission, and, eq, schema } from '@synopsis/db';
import { z } from 'zod';

import { db } from '~/services/database';

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

        if (index === -1) throw new Error('Invalid local permission level.');
        if (highestIndex === null || index < highestIndex) highestIndex = index;
    }

    if (highestIndex === null) throw new Error('No local permission levels provided.');

    const level = localLevels[highestIndex];
    if (!level) throw new Error('Invalid local permission level.');

    return level;
}

export function determineHighestGlobalLevel(...levels: GlobalLevel[]): GlobalLevel {
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
}

export const satisfies = {
    local: ({ required, current }: { required: LocalLevel; current: LocalLevel }): boolean => {
        return determineHighestLocalLevel(required, current) === current;
    },
    global: ({ required, current }: { required: GlobalLevel; current: GlobalLevel }): boolean => {
        return determineHighestGlobalLevel(required, current) === current;
    },
};

export function mapMessageToContext(message: PrivmsgMessage): PermissionContext {
    function getLocalPermissionFromMessage(): LocalLevelFromMessage | null {
        const { isMod, channelName, senderUsername, badges } = message;
        const isBroadcaster = channelName === senderUsername;
        const isVip = badges.hasVIP;

        if (isBroadcaster) return 'broadcaster';
        if (isMod) return 'moderator';
        if (isVip) return 'vip';
        return null;
    }

    return {
        user: { id: message.senderUserID, login: message.senderUsername },
        channel: { id: message.channelID, login: message.channelName },
        messageLevel: getLocalPermissionFromMessage(),
    };
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
    messageLevel: LocalLevelFromMessage | null;
}

class PermissionsService {
    async getDbLocalPermission({
        channel,
        user,
    }: Pick<PermissionContext, 'channel' | 'user'>): Promise<LocalLevelFromDatabase | null> {
        const result = await db.query.localPermissions.findFirst({
            where: (table, { and, eq }) => {
                return and(eq(table.channelId, channel.id), eq(table.userId, user.id));
            },
            columns: { permission: true },
        });

        return result?.permission ?? null;
    }

    private async getDbGlobalPermission({
        user,
    }: Pick<PermissionContext, 'user'>): Promise<GlobalLevelFromDatabase | null> {
        const result = await db.query.globalPermissions.findFirst({
            where: (table, { eq }) => {
                return eq(table.userId, user.id);
            },
            columns: { permission: true },
        });

        return result?.permission ?? null;
    }

    async getGlobalPermission(context: Pick<PermissionContext, 'user'>): Promise<GlobalLevel> {
        return (await this.getDbGlobalPermission(context)) ?? 'normal';
    }

    async getLocalPermission(context: PermissionContext): Promise<LocalLevel> {
        const localFromDatabase = await this.getDbLocalPermission(context);

        // if the user is banned, we don't care about the other permissions
        if (localFromDatabase === 'banned') return 'banned';

        if (localFromDatabase && context.messageLevel) {
            return determineHighestLocalLevel(localFromDatabase, context.messageLevel);
        }

        return localFromDatabase ?? context.messageLevel ?? 'normal';
    }

    async getPermissions(context: PermissionContext): Promise<{
        local: LocalLevel;
        global: GlobalLevel;
    }> {
        const [local, global] = await Promise.all([
            this.getLocalPermission(context),
            this.getGlobalPermission(context),
        ]);

        return { local, global };
    }

    async setLocalPermission(
        permission: LocalLevelFromDatabase | 'normal',
        context: Pick<PermissionContext, 'user' | 'channel'>,
    ): Promise<void> {
        const existingDatabasePermission = await this.getDbLocalPermission(context);
        if (existingDatabasePermission === permission) {
            return;
        }

        if (permission === 'normal') {
            if (!existingDatabasePermission) {
                return;
            }
            await db
                .delete(schema.localPermissions)
                .where(
                    and(
                        eq(schema.localPermissions.channelId, context.channel.id),
                        eq(schema.localPermissions.userId, context.user.id),
                    ),
                );

            return;
        }

        const databasePermission: NewLocalPermission = {
            channelLogin: context.channel.login,
            channelId: context.channel.id,
            userId: context.user.id,
            userLogin: context.user.login,
            permission,
        };

        if (!existingDatabasePermission) {
            await db.insert(schema.localPermissions).values(databasePermission);
            return;
        }

        await db
            .update(schema.localPermissions)
            .set(databasePermission)
            .where(
                and(
                    eq(schema.localPermissions.channelId, context.channel.id),
                    eq(schema.localPermissions.userId, context.user.id),
                ),
            );
    }

    async setGlobalPermission(permission: GlobalLevel, context: Pick<PermissionContext, 'user'>) {
        const existingDatabasePermission = await this.getDbGlobalPermission(context);

        if (permission === 'normal') {
            if (!existingDatabasePermission) {
                return;
            }
            await db
                .delete(schema.globalPermissions)
                .where(eq(schema.globalPermissions.userId, context.user.id));
            return;
        }

        const databasePermission: NewGlobalPermission = {
            permission,
            userId: context.user.id,
            userLogin: context.user.login,
        };

        if (!existingDatabasePermission) {
            await db.insert(schema.globalPermissions).values(databasePermission);
            return;
        }

        await db
            .update(schema.globalPermissions)
            .set(databasePermission)
            .where(eq(schema.globalPermissions.userId, context.user.id));
    }

    async satisfiesLocal(required: LocalLevel, context: PermissionContext) {
        const current = await this.getLocalPermission(context);
        return {
            level: current,
            satisfies: satisfies.local({ required, current }),
        };
    }

    async satisfiesGlobal(required: GlobalLevel, context: Pick<PermissionContext, 'user'>) {
        const current = await this.getGlobalPermission(context);
        return {
            level: current,
            satisfies: satisfies.global({ required, current }),
        };
    }

    async satisfiesPermissions(
        required: { global: GlobalLevel; local: LocalLevel },
        context: PermissionContext,
    ) {
        const [global, local] = await Promise.all([
            this.satisfiesGlobal(required.global, context),
            this.satisfiesLocal(required.local, context),
        ]);

        return { global, local };
    }
}

export const permissions = new PermissionsService();
