// @ts-check
const fs = require('node:fs/promises');

/** @type {import('@commitlint/types').UserConfig} */
const config = {
    extends: ['@commitlint/config-conventional'],
    rules: {
        'scope-enum': async () => {
            const packages = await fs.readdir(`${__dirname}/packages`);
            const scopes = [
                ...packages,
                'bot/commands',
                'bot/commands',
                'bot/modules',
                'website',
                'pkgs',
                'apps',
                'monorepo',
                'deps',
            ];
            return [1, 'always', scopes];
        },
    },
};

module.exports = config;
