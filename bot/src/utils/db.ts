import {
    type AuthedUser,
    authedUsers,
    eq,
    type NodePgDatabase,
    type UpdateAuthedUser,
} from '@synopsis/db';

type GetAuthedUserByIdOverloads = {
    (db: NodePgDatabase, id: string): Promise<AuthedUser | null>;
    (db: NodePgDatabase, id: string, options: { throws: true }): Promise<AuthedUser>;
    (db: NodePgDatabase, id: string, options: { throws: false }): Promise<AuthedUser | null>;
};

export const getAuthedUserById: GetAuthedUserByIdOverloads = async (
    db: NodePgDatabase,
    id: string,
    options?: { throws: true } | { throws: false }
): Promise<AuthedUser> => {
    const [user] = await db.select().from(authedUsers).where(eq(authedUsers.twitchId, id)).limit(1);
    if (options?.throws && !user) throw new Error(`No authed user found with id ${id}`);
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return user! ?? null;
};

export const updateAuthedUserById = async (
    db: NodePgDatabase,
    id: string,
    fieldsToUpdate: UpdateAuthedUser
) => {
    const updatedUser = await db
        .update(authedUsers)
        .set(fieldsToUpdate)
        .where(eq(authedUsers.twitchId, id))
        .returning();

    return updatedUser[0];
};
