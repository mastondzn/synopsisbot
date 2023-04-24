import { ApiClient } from '@twurple/api';
import { type AccessToken, RefreshingAuthProvider } from '@twurple/auth';

import { updateAuthedUserById } from '@synopsis/db';

import { db } from './db';
import { env } from '~/env.mjs';

export const authProvider = new RefreshingAuthProvider({
    clientId: env.TWITCH_CLIENT_ID,
    clientSecret: env.TWITCH_CLIENT_SECRET,
    onRefresh: async (userId: string, token: AccessToken) => {
        await updateAuthedUserById(db, userId, {
            accessToken: token.accessToken,
            scopes: token.scope,
            ...(token.refreshToken ? { refreshToken: token.refreshToken } : {}),
            ...(token.expiresIn
                ? { expiresAt: new Date(Date.now() + token.expiresIn * 1000) }
                : {}),
        });
    },
});

export const api = new ApiClient({ authProvider });
