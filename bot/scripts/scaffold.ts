import { writeFile } from 'node:fs/promises';
import { join } from 'node:path';

import inquirer from 'inquirer';

import { type StandaloneScript } from '~/types/scripts';

export const script: StandaloneScript = {
    description: 'scaffold a new script',
    type: 'standalone',
    run: async () => {
        const { file } = await inquirer.prompt<{ file: string }>({
            name: 'file',
            type: 'input',
            message: 'What is the name of the file?',
        });

        const choices = ['bot', 'db', 'cache', 'api', 'chat', 'standalone'] as const;
        const { type } = await inquirer.prompt<{ type: (typeof choices)[number] }>({
            name: 'type',
            type: 'list',
            choices,
            message: 'What is the type of the script?',
        });

        const getTypeName = (type: (typeof choices)[number]): string => {
            const typeMap: Record<(typeof choices)[number], string> = {
                standalone: 'StandaloneScript',
                bot: 'BotScript',
                db: 'DatabaseScript',
                cache: 'CacheScript',
                api: 'TwitchApiScript',
                chat: 'TwitchChatScript',
            };
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
            .replace(/^ {12}/gm, '');

        const path = join(__dirname, `${file}.ts`);
        await writeFile(path, fileContents);

        console.log(`Done! ${path}`);
    },
};
