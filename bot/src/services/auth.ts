import { env } from '@synopsis/env/node';
import { RefreshingAuthProvider } from '@twurple/auth';

export const authProvider = new RefreshingAuthProvider({
    clientId: env.TWITCH_CLIENT_ID,
    clientSecret: env.TWITCH_CLIENT_SECRET,
});
