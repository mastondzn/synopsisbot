import { pickOne } from '~/helpers/array';
import { createCommand } from '~/helpers/command/define';

export default createCommand({
    name: '8ball',
    description: 'Ask the magic 8ball a question!',
    aliases: ['8b'],
    run: ({ parameters }) => {
        if (!parameters.text) {
            return {
                reply: 'You must ask a question! The magic 8ball cannot read your mind. 🎱',
            };
        }

        const responses = [
            'It is certain.',
            'It is decidedly so.',
            'Without a doubt.',
            'Yes - definitely.',
            'You may rely on it.',
            'As I see it, yes.',
            'Most likely.',
            'Outlook good.',
            'Yes.',
            'Signs point to yes.',
            'Reply hazy, try again.',
            'Ask again later.',
            'Better not tell you now.',
            'Cannot predict now.',
            'Concentrate and ask again.',
            "Don't count on it.",
            'My reply is no.',
            'My sources say no.',
            'Outlook not so good.',
            'Very doubtful.',
        ];

        return { reply: `${pickOne(responses)} 🎱` };
    },
});
