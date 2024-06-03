import { authedUsers, eq } from '@synopsis/db';
import { env } from '@synopsis/env/next';
import { ApiClient } from '@twurple/api';
import { type AccessToken, RefreshingAuthProvider } from '@twurple/auth';

import { db } from './db';

export const authProvider = new RefreshingAuthProvider({
    clientId: env.TWITCH_CLIENT_ID,
    clientSecret: env.TWITCH_CLIENT_SECRET,
});

authProvider.onRefresh((userId: string, token: AccessToken) => {
    void db
        .update(authedUsers)
        .set({
            accessToken: token.accessToken,
            scopes: token.scope,
            ...(token.refreshToken ? { refreshToken: token.refreshToken } : {}),
            ...(token.expiresIn
                ? { expiresAt: new Date(Date.now() + token.expiresIn * 1000) }
                : {}),
        })
        .where(eq(authedUsers.twitchId, userId))
        .execute();
});

export const api = new ApiClient({ authProvider });
