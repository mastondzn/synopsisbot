import { ApiClient } from '@twurple/api';
import { type AccessToken, RefreshingAuthProvider } from '@twurple/auth';

import { env } from '@synopsis/env/next';
import { db } from '@synopsis/db/next';

export const authProvider = new RefreshingAuthProvider({
    clientId: env.TWITCH_CLIENT_ID,
    clientSecret: env.TWITCH_CLIENT_SECRET,
    onRefresh: async (userId: string, token: AccessToken) => {
        await db.authedUser.update({
            where: { twitchId: userId },
            data: {
                accessToken: token.accessToken,
                scopes: token.scope,
                ...(token.refreshToken ? { refreshToken: token.refreshToken } : {}),
                ...(token.expiresIn
                    ? { expiresAt: new Date(Date.now() + token.expiresIn * 1000) }
                    : {}),
            },
        });
    },
});

export const api = new ApiClient({ authProvider });
