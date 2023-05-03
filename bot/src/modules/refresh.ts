import { env } from '@synopsis/env/node';

import { type BotModule } from '~/types/client';

export const module: BotModule = {
    name: 'refresh',
    description: "ensures the bot's oauth token is always up to date",
    register: ({ authProvider, chat }) => {
        authProvider.events.on('refresh', (token) => {
            if (token.userId !== env.TWITCH_BOT_OWNER_ID) return;

            chat.configuration.password = `oauth:${token.accessToken}`;

            console.log("[modules:refresh] refreshed bot's oauth token");
        });
    },
};
