import type { DrizzleDatabase } from '../types';

export class FindHelpers {
    private db: DrizzleDatabase;

    constructor(db: DrizzleDatabase) {
        this.db = db;
    }

    async authedUserById(id: string) {
        return await this.db.query.authedUsers.findFirst({
            where: ({ twitchId }, { eq }) => eq(twitchId, id),
        });
    }

    async authedUserByIdThrows(id: string) {
        const user = await this.authedUserById(id);
        if (!user) {
            throw new Error(`User with ID ${id} not found in database`);
        }
        return user;
    }

    async authedUserByLogin(login: string) {
        return await this.db.query.authedUsers.findFirst({
            where: ({ twitchLogin }, { eq }) => eq(twitchLogin, login),
        });
    }

    async authedUserByLoginThrows(login: string) {
        const user = await this.authedUserByLogin(login);
        if (!user) {
            throw new Error(`User with login ${login} not found in database`);
        }
        return user;
    }

    async channelModeById(id: string) {
        const result = await this.db.query.channels.findFirst({
            where: ({ twitchLogin }, { eq }) => eq(twitchLogin, id),
            columns: { mode: true },
        });

        return result?.mode;
    }

    async channelModeByLogin(login: string) {
        const result = await this.db.query.channels.findFirst({
            where: ({ twitchLogin }, { eq }) => eq(twitchLogin, login),
            columns: { mode: true },
        });

        return result?.mode;
    }
}
