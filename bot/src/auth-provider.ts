import { type AccessToken, RefreshingAuthProvider } from '@twurple/auth';

import { getAuthedUserByIdThrows, type NodePgDatabase, updateAuthedUserById } from '@synopsis/db';

export interface BotAuthProviderOptions {
    db: NodePgDatabase;
    clientId: string;
    clientSecret: string;
    botId: string;
    botAccessToken: string;
    botRefreshToken: string;
    botScopes: string[];
    expiresIn: number;
    obtainmentTimestamp: number;
}

export interface MakeBotAuthProviderOptions {
    db: NodePgDatabase;
    clientId: string;
    clientSecret: string;
    botId: string;
}

export const makeBotAuthProvider = async (options: MakeBotAuthProviderOptions) => {
    const bot = await getAuthedUserByIdThrows(options.db, options.botId);

    return new BotAuthProvider({
        db: options.db,
        clientId: options.clientId,
        clientSecret: options.clientSecret,
        botAccessToken: bot.accessToken,
        botRefreshToken: bot.refreshToken,
        botId: bot.twitchId,
        botScopes: bot.scopes,
        expiresIn: (bot.expiresAt.getTime() - Date.now()) / 1000,
        obtainmentTimestamp: bot.obtainedAt.getTime(),
    });
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
