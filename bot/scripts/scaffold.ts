import { writeFile } from 'node:fs/promises';
import { join } from 'node:path';

import { listPrompt, prompt } from './utils';
import { type StandaloneScript } from '~/types/scripts';

export const script: StandaloneScript = {
    description: 'scaffold a new script',
    type: 'standalone',
    run: async () => {
        const { response: file } = await prompt({
            message: 'What is the name of the file?',
        });

        const choices = ['bot', 'db', 'cache', 'api', 'chat', 'standalone'] as const;
        const { response: type } = await listPrompt({
            list: ['bot', 'db', 'cache', 'api', 'chat', 'standalone'],
            message: 'What is the type of the script?',
        });

        const getTypeName = (type: (typeof choices)[number]): string => {
            const typeMap = {
                standalone: 'StandaloneScript',
                bot: 'BotScript',
                db: 'DatabaseScript',
                cache: 'CacheScript',
                api: 'TwitchApiScript',
                chat: 'TwitchChatScript',
            } satisfies Record<(typeof choices)[number], string>;
            return typeMap[type];
        };

        const typeName = getTypeName(type);

        const isStandalone = type === 'standalone';

        const fileContents = `
            import { type ${typeName} } from '~/types/scripts';
            
            export const script: ${typeName} = {
                description: '',
                type: '${type}',
                run: async (${isStandalone ? '' : `{ ${type} }`}) => {
                    //
                },
            };
            `
            .trimStart()
            .replaceAll(/^ {12}/gm, '');

        const path = join(__dirname, `${file}.ts`);
        await writeFile(path, fileContents);

        console.log(`Done! ${path}`);
    },
};
