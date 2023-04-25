import { type AccessToken, RefreshingAuthProvider } from '@twurple/auth';

import { type NodePgDatabase, updateAuthedUserById } from '@synopsis/db';

export interface BotAuthProviderOptions {
    db: NodePgDatabase;
    clientId: string;
    clientSecret: string;
    twitchId: string;
    accessToken: string;
    refreshToken: string;
    scopes: string[];
    expiresAt: Date;
    obtainedAt: Date;
}

export class BotAuthProvider extends RefreshingAuthProvider {
    constructor(options: BotAuthProviderOptions) {
        const onRefresh = async (userId: string, token: AccessToken) => {
            await updateAuthedUserById(options.db, userId, {
                accessToken: token.accessToken,
                scopes: token.scope,
                ...(token.refreshToken ? { refreshToken: token.refreshToken } : {}),
                ...(token.expiresIn
                    ? { expiresAt: new Date(Date.now() + token.expiresIn * 1000) }
                    : {}),
            });
        };

        super({
            clientId: options.clientId,
            clientSecret: options.clientSecret,
            onRefresh,
        });

        this.addUser(
            options.twitchId,
            {
                expiresIn: (options.expiresAt.getTime() - Date.now()) / 1000,
                obtainmentTimestamp: options.obtainedAt.getTime(),
                accessToken: options.accessToken,
                refreshToken: options.refreshToken,
            },
            ['chat']
        );
    }
}
