const { readdir } = require('node:fs/promises');
const { join } = require('node:path');

/** @satisfies {import('@commitlint/types').UserConfig} */
const config = {
    extends: ['@commitlint/config-conventional'],
    rules: {
        'scope-enum': async () => {
            const packages = await readdir(join(__dirname, '/packages'));
            const commands = await readdir(join(__dirname, '/bot/src/commands'));

            const scopes = [
                ...commands.map((command) => `commands/${command.replace(/\..*/, '')}`),
                ...packages,
                'bot',
                'website',
                'deps',
            ];

            return [2, 'always', scopes];
        },
    },
};

module.exports = config;
