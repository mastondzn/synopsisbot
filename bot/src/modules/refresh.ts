import { ClientError } from '@kararty/dank-twitch-irc';
import { env } from '@synopsis/env/node';

import { defineModule } from '~/helpers/module/define';
import { authProvider } from '~/services/auth';
import { chat } from '~/services/chat';
import { db } from '~/services/database';

async function updateToken(password: string) {
    await chat.say(env.TWITCH_BOT_OWNER_USERNAME, 'refreshing token');
    chat.configuration.password = password;
    chat.emitError(new ClientError('refreshing auth'));
    console.log('attempted to reconnect');
}

export default defineModule({
    name: 'refresh',
    description: 'ensures the bot\'s oauth token is always up to date',
    register: () => {
        authProvider.onRefresh((userId, token) => {
            void db.edit.authedUserById(userId, {
                accessToken: token.accessToken,
                scopes: token.scope,
                ...(token.refreshToken ? { refreshToken: token.refreshToken } : {}),
                ...(token.expiresIn ? { expiresAt: new Date(Date.now() + token.expiresIn * 1000) } : {}),
            });

            if (userId !== env.TWITCH_BOT_ID) return;
            if (!token.expiresIn) throw new Error('Bot token not found');

            void updateToken(token.accessToken);
            setTimeout(() => {
                void authProvider.refreshAccessTokenForIntent('chat');
            }, (token.expiresIn * 1000) - 1000 * 60 * 60);
        });
    },
});
