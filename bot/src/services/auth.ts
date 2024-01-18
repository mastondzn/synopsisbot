import { env } from '@synopsis/env/node';
import { RefreshingAuthProvider } from '@twurple/auth';

import { db } from './database';

export const authProvider = new RefreshingAuthProvider({
    clientId: env.TWITCH_CLIENT_ID,
    clientSecret: env.TWITCH_CLIENT_SECRET,
});

authProvider.onRefresh((userId, token) => {
    void db.edit.authedUserById(userId, {
        accessToken: token.accessToken,
        scopes: token.scope,
        ...(token.refreshToken ? { refreshToken: token.refreshToken } : {}),
        ...(token.expiresIn ? { expiresAt: new Date(Date.now() + token.expiresIn * 1000) } : {}),
    });
});
