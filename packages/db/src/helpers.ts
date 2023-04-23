import { eq } from 'drizzle-orm';
import { type NodePgDatabase } from 'drizzle-orm/node-postgres';

import { type AuthedUser, authedUsers, channels, type UpdateAuthedUser } from './schema';

export const getAuthedUserById = async (
    db: NodePgDatabase,
    id: string
): Promise<AuthedUser | null> => {
    const [user] = await db.select().from(authedUsers).where(eq(authedUsers.twitchId, id)).limit(1);
    return user ?? null;
};

export const getAuthedUserByIdThrows = async (
    db: NodePgDatabase,
    id: string
): Promise<AuthedUser> => {
    const user = await getAuthedUserById(db, id);
    if (!user) throw new Error(`User with ID ${id} not found in database`);
    return user;
};

export const updateAuthedUserById = async (
    db: NodePgDatabase,
    id: string,
    fieldsToUpdate: UpdateAuthedUser
) => {
    const [updatedUser] = await db
        .update(authedUsers)
        .set(fieldsToUpdate)
        .where(eq(authedUsers.twitchId, id))
        .returning();

    return updatedUser;
};

export const updateAuthedUserByIdThrows = async (
    db: NodePgDatabase,
    id: string,
    fieldsToUpdate: UpdateAuthedUser
) => {
    const updatedUser = await updateAuthedUserById(db, id, fieldsToUpdate);
    if (!updatedUser) throw new Error(`User with ID ${id} not found in database`);
    return updatedUser;
};

export const getChannelModeByLogin = async (db: NodePgDatabase, login: string) => {
    const result = await db.select().from(channels).where(eq(channels.twitchLogin, login)).limit(1);
    return result[0]?.mode ?? null;
};
