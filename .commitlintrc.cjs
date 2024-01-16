const { readdir } = require('node:fs/promises');
const { join } = require('node:path');

/** @type {import('@commitlint/types').UserConfig} */
const config = {
    extends: ['@commitlint/config-conventional'],
    rules: {
        'scope-enum': async () => {
            const packages = await readdir(join(__dirname, '/packages'));
            const scopes = [
                ...packages,
                'bot/commands',
                'bot/modules',
                'bot',
                'website',
                'packages',
                'apps',
                'monorepo',
                'deps',
            ];
            return [2, 'always', scopes];
        },
    },
};

module.exports = config;
