import { randomInt } from 'node:crypto';

import { createCommand } from '~/helpers/command/define';

export default createCommand({
    name: 'coinflip',
    description: 'Flips a coin.',
    aliases: ['cf'],
    run: () => {
        const result = randomInt(0, 1) === 0;

        const coin = result ? 'heads' : 'tails';
        const answer = result ? 'yes' : 'no';

        return {
            reply: `It's ${coin}! (${answer})`,
        };
    },
});
