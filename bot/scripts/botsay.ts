import inquirer from 'inquirer';

import { type BotScript } from '~/types/scripts';

export const script: BotScript = {
    type: 'bot',
    description: 'say something in chat',
    run: async ({ bot }) => {
        const { channelInput } = await inquirer.prompt<{ channelInput: string }>({
            type: 'input',
            name: 'channelInput',
            message: 'Which channel?',
        });

        const channel = await bot.api.users.getUserByName(channelInput.toLowerCase());
        if (!channel) throw new Error('Channel not found!');

        console.log(bot.chat.currentChannels);

        if (!bot.chat.currentChannels.includes(`#${channel.name}`)) {
            throw new Error('Bot is not in that channel!');
        }

        const { message } = await inquirer.prompt<{ message: string }>({
            type: 'input',
            name: 'message',
            message: 'What should I say?',
        });

        await bot.chat.say(channel.name, message);
    },
};
