import { createCommand } from '~/helpers/command/define';
import { zfetch } from '~/helpers/fetch';

export default createCommand({
    name: 'math',
    description: 'Uses math.js to evaluate a math expression.',
    run: async ({ parameters: { text } }) => {
        if (!text) {
            return { reply: "You didn't provide a expression to evaluate. :/" };
        }

        const url = new URL('http://api.mathjs.org/v4/');
        url.searchParams.append('expr', text);

        return { reply: await zfetch({ url }).text() };
    },
});
