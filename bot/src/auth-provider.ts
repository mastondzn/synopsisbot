import { type AccessToken, RefreshingAuthProvider } from '@twurple/auth';

import { type NodePgDatabase } from '@synopsis/db';

import { updateAuthedUserById } from './utils/db';

export type BotAuthProviderOptions = {
    db: NodePgDatabase;
    clientId: string;
    clientSecret: string;
    botId: string;
    botAccessToken: string;
    botRefreshToken: string;
    botScopes: string[];
    expiresIn: number;
    obtainmentTimestamp: number;
};

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
            options.botId,
            {
                expiresIn: options.expiresIn,
                obtainmentTimestamp: options.obtainmentTimestamp,
                accessToken: options.botAccessToken,
                refreshToken: options.botRefreshToken,
            },
            ['chat']
        );
    }
}
