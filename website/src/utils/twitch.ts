import { RefreshingAuthProvider } from '@twurple/auth';

import { env } from '~/env.mjs';

export const authProvider = new RefreshingAuthProvider({
    clientId: env.TWITCH_CLIENT_ID,
    clientSecret: env.TWITCH_CLIENT_SECRET,
});
