import { prompt } from './utils';
import { type BotScript } from '~/types/scripts';

export const script: BotScript = {
    type: 'bot',
    description: 'say something in chat',
    run: async ({ bot }) => {
        const { response: promptChannel } = await prompt({
            message: 'Which channel?',
        });

        const channel = await bot.api.users.getUserByName(promptChannel.toLowerCase());
        if (!channel) throw new Error('Channel not found!');

        if (!bot.chat.joinedChannels.has(channel.name)) {
            throw new Error('Bot is not in that channel!');
        }

        const { response: message } = await prompt({
            message: 'What should I say?',
        });

        await bot.chat.say(channel.name, message);
    },
};
