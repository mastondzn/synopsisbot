import { env } from '@synopsis/env/node';
import ms from 'pretty-ms';

import { createCron } from '~/helpers/cron/define';
import { logger } from '~/helpers/logger';
import { authProvider } from '~/services/auth';
import { chat } from '~/services/chat';
import { db } from '~/services/database';

export default createCron({
    name: 'refresh',
    // every 30 minutes
    cronTime: '0 */30 * * * *',
    onTick: async () => {
        const token = await db.query.authedUsers.findFirst({
            where: ({ twitchId }, { eq }) => eq(twitchId, env.TWITCH_BOT_ID),
        });

        if (!token?.expiresAt) {
            logger.refresh('Token not found or no expiration');
            return;
        }

        const expiresIn = token.expiresAt.getTime() - Date.now();
        // if it expires in more than 30 minutes, don't refresh
        if (expiresIn > 30 * 60 * 1000) {
            logger.refresh(
                `Token does not need refreshing, expires at ${token.expiresAt.toISOString()}. (in ${ms(expiresIn)})`,
            );
            return;
        }

        logger.refresh('Refreshing bot token...');
        const newToken = await authProvider.refreshAccessTokenForIntent('chat');
        chat.configuration.password = newToken.accessToken;
        for (const connection of chat.connections) {
            connection.close();
        }

        const line = `Bot token refreshed, expires in ${newToken.expiresIn} seconds.`;
        logger.refresh(line);
    },
});
