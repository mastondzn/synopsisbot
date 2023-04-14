import { type BotCommand } from '~/types/client';

export const command: BotCommand = {
    name: 'ping',
    description: 'Replies with pong! To ensure the bot is alive.',
    run: async ({ msg, client }) => {
        await client.say(msg.channel, `@${msg.userInfo.displayName}, Pong! 🏓`, {
            replyTo: msg.id,
        });
    },
};
