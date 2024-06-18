import { inspect } from 'node:util';

import { createCommand } from '~/helpers/command/define';

export default createCommand({
    name: 'eval',
    description: 'Unsafely evals code.',
    permissions: {
        global: 'owner',
    },
    run: async ({ parameters: { text } }) => {
        if (!text) {
            return { reply: 'No code to eval.' };
        }

        // eslint-disable-next-line no-eval
        const result: unknown = await eval(text);

        const inspected = inspect(result, {
            depth: 2,
            colors: false,
            breakLength: Number.POSITIVE_INFINITY,
        }).replaceAll('\n', ' ');

        if (inspected.length > 475) {
            return { reply: `${inspected.slice(0, 475)}... (too long)` };
        }

        return { reply: inspected };
    },
});
