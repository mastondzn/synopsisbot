import { create } from '~/helpers/creators';

export default create.command({
    name: 'coinflip',
    description: 'Flips a coin!',
    aliases: ['cf'],
    run: () => {
        const result = Math.random() < 0.5;

        const coin = result ? 'heads' : 'tails';
        const answer = result ? 'yes' : 'no';

        return {
            reply: `It's ${coin}! (${answer})`,
        };
    },
});
