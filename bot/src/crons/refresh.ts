import { ClientError } from '@kararty/dank-twitch-irc';
import { env } from '@synopsis/env/node';

import { defineCron } from '~/helpers/cron/define';
import { prefixes } from '~/helpers/log-prefixes';
import { authProvider, chat } from '~/services';

export default defineCron({
    name: 'refresh',
    // every 30 minutes
    cronTime: '0 */30 * * * *',
    onTick: async () => {
        const token = await authProvider.getAccessTokenForIntent('chat');
        if (!token?.expiresIn) {
            console.warn(prefixes.refresh, 'Token not found or no expiration');
            return;
        }

        // if it expires in more than 30 minutes, don't refresh
        if (token.expiresIn > 30 * 60) {
            const line = `Token does not need refreshing, expires in ${token.expiresIn} seconds`;
            await chat.say(env.TWITCH_BOT_OWNER_USERNAME, line);
            console.log(prefixes.refresh, line);
            return;
        };

        console.log(prefixes.refresh, 'Refreshing bot token');
        await chat.say(env.TWITCH_BOT_OWNER_USERNAME, 'Refreshing bot token...');

        const newToken = await authProvider.refreshAccessTokenForIntent('chat');
        chat.configuration.password = newToken.accessToken;
        // Marks an error that mandates a disconnect of the whole client and all its connections
        chat.emitError(new ClientError('refreshing auth'));
        const line = `Bot token refreshed, expires in ${newToken.expiresIn} seconds.`;
        console.log(prefixes.refresh, line);
        await chat.say(env.TWITCH_BOT_OWNER_USERNAME, line);
    },
});
