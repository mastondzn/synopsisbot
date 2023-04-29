import { type BotCommand } from '~/types/client';
import { pickOne } from '~/utils/functions';

export const command: BotCommand = {
    name: '8ball',
    description: 'Ask the magic 8ball a question',
    run: async ({ reply, params }) => {
        if (!params.text) {
            return await reply(
                'you must ask a question! The magic 8ball cannot read your mind. 🎱'
            );
        }

        const responses = [
            'it is certain.',
            'it is decidedly so.',
            'without a doubt.',
            'yes - definitely.',
            'you may rely on it.',
            'as I see it, yes.',
            'most likely.',
            'outlook good.',
            'yes.',
            'signs point to yes.',
            'reply hazy, try again.',
            'ask again later.',
            'better not tell you now.',
            'cannot predict now.',
            'concentrate and ask again.',
            "don't count on it.",
            'my reply is no.',
            'my sources say no.',
            'outlook not so good.',
            'very doubtful.',
        ];

        return await reply(`${pickOne(responses)} 🎱`);
    },
};
