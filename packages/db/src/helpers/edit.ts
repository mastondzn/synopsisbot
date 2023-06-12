import { eq } from 'drizzle-orm';

import { authedUsers, type UpdateAuthedUser } from '../schema';
import { type DatabaseWithoutHelpers } from '../types';

export class EditHelpers {
    private db: DatabaseWithoutHelpers;

    constructor(db: DatabaseWithoutHelpers) {
        this.db = db;
    }

    async authedUserById(id: string, fields: UpdateAuthedUser) {
        return await this.db
            .update(authedUsers)
            .set(fields)
            .where(eq(authedUsers.twitchId, id))
            .returning()
            .then(([updated]) => updated);
    }

    async authedUserByIdThrows(id: string, fields: UpdateAuthedUser) {
        const updatedUser = await this.authedUserById(id, fields);
        if (!updatedUser) throw new Error(`User with ID ${id} not found in database`);
        return updatedUser;
    }

    async authedUserByLogin(login: string, fields: UpdateAuthedUser) {
        return await this.db
            .update(authedUsers)
            .set(fields)
            .where(eq(authedUsers.twitchLogin, login))
            .returning()
            .then(([updated]) => updated);
    }

    async authedUserByLoginThrows(login: string, fields: UpdateAuthedUser) {
        const updatedUser = await this.authedUserByLogin(login, fields);
        if (!updatedUser) throw new Error(`User with login ${login} not found in database`);
        return updatedUser;
    }
}
