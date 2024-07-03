import { create } from '~/helpers/creators';
import { zfetch } from '~/helpers/fetch';
import { trim } from '~/helpers/tags';

export default create.command({
    name: 'math',
    description: 'Uses math.js to evaluate a math expression.',
    run: async ({ parameters: { text } }) => {
        if (!text) {
            return { reply: "You didn't provide a expression to evaluate. :/" };
        }

        const url = new URL('http://api.mathjs.org/v4/');
        url.searchParams.append('expr', text);
        url.searchParams.append('precision', '4');

        const response = await zfetch({ url });

        if (!response.ok) {
            const error = (await response.text()).replace('Error: ', '');
            return {
                reply: trim`Failed to evaluate the expression. ${error ? `(${error})` : ''}`,
            };
        }

        return { reply: await response.text() };
    },
});
