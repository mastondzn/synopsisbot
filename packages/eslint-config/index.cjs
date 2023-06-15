// @ts-check
const { defineConfig } = require('eslint-define-config');
const fs = require('node:fs');

/** @type {import('type-fest').PackageJson} */
const packageJson = JSON.parse(
    fs.readFileSync(`${process.cwd()}/package.json`, 'utf8') //
);

/**
 * @param {string} name
 * @returns {boolean}
 */
const hasDependency = (name) => {
    return (
        packageJson.dependencies?.[name] !== undefined ||
        packageJson.devDependencies?.[name] !== undefined
    );
};

const hasReact = hasDependency('react');
const hasTailwind = hasDependency('tailwindcss');
const hasNext = hasDependency('next');

module.exports = defineConfig({
    extends: [
        'eslint:recommended',
        'plugin:unicorn/recommended',
        'plugin:import/recommended',
        'turbo',
    ],
    env: {
        browser: true,
        es2021: true,
        node: true,
    },
    overrides: [
        {
            files: ['*.ts', '*.tsx', '*.d.ts', '*.cts', '*.mts'],
            parser: '@typescript-eslint/parser',
            parserOptions: {
                project: `${process.cwd()}/tsconfig.json`,
            },
            plugins: [
                'simple-import-sort',
                '@typescript-eslint',
                'import',
                'unicorn',
                'react',
                'react-hooks',
                'tailwindcss',
            ],
            extends: (() => {
                const configs = [
                    'plugin:import/typescript',
                    'plugin:@typescript-eslint/recommended',
                    'plugin:@typescript-eslint/recommended-requiring-type-checking',
                    'plugin:@typescript-eslint/strict',
                ];

                if (hasReact) {
                    configs.push(
                        'plugin:react/recommended',
                        'plugin:react/jsx-runtime',
                        'plugin:react-hooks/recommended'
                    );
                }

                if (hasTailwind) {
                    configs.push('plugin:tailwindcss/recommended');
                }
                if (hasNext) {
                    configs.push('next', 'next/core-web-vitals');
                }

                configs.push('prettier');
                return configs;
            })(),
            settings: {
                react: { version: 'detect' },
                'import/resolver': {
                    typescript: true,
                    node: true,
                },
                tailwindcss: {
                    callees: ['tw', 'clsx', 'twMerge', 'cva', 'cn'],
                },
            },
            rules: {
                'simple-import-sort/imports': [
                    'error',
                    {
                        // Custom import grouping see https://github.com/lydell/eslint-plugin-simple-import-sort#custom-grouping
                        // Type imports always go last in their group
                        groups: [
                            // Side effect imports. (import './file.ts')
                            [String.raw`^\u0000`],
                            // Node.js builtins prefixed with `node:`. (they get enforced by 'unicorn/prefer-node-protocol')
                            [String.raw`^node:`, String.raw`^node:.*\u0000$`],
                            // Packages.
                            // Things that start with a letter (or digit or underscore), or `@` followed by a letter.
                            // But not local monorepo packages.
                            [
                                String.raw`^(?!@synopsis\/)@?\w`,
                                String.raw`^(?!@synopsis\/)@?\w.*\u0000$`,
                            ],
                            // Imports from local monorepo packages
                            [String.raw`^@synopsis/`, String.raw`^@synopsis/.*\u0000$`],
                            // Local package imports.
                            // Anything that starts with a dot or ~/
                            [
                                String.raw`^\.`,
                                String.raw`^`,
                                String.raw`^~/`,
                                String.raw`^\..*\u0000$`,
                                String.raw`^[^.].*\u0000$`,
                                String.raw`^~/.*\u0000$`,
                            ],
                        ],
                    },
                ],

                'no-restricted-globals': (() => {
                    const message = 'Do not use jest globals in non-test files.';

                    // https://jestjs.io/docs/api
                    const jestGlobals = [
                        'beforeAll',
                        'beforeEach',
                        'afterAll',
                        'afterEach',
                        'describe',
                        'fdescribe',
                        'xdescribe',
                        'it',
                        'fit',
                        'xit',
                        'test',
                        'xtest',
                        'expect',
                        'jasmine',
                    ];

                    return ['error', ...jestGlobals.map((global) => ({ name: global, message }))];
                })(),

                // Prefer shorthand object notation
                'object-shorthand': ['error', 'always'],

                '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
                '@typescript-eslint/consistent-type-imports': [
                    'error',
                    {
                        prefer: 'type-imports',
                        disallowTypeAnnotations: true,
                        fixStyle: 'inline-type-imports',
                    },
                ],
                '@typescript-eslint/no-misused-promises': ['error', { checksVoidReturn: false }],

                'unicorn/no-null': 'off',
                'unicorn/prevent-abbreviations': 'off',
                'unicorn/prefer-module': 'off',
                'unicorn/prefer-top-level-await': 'off',
                'unicorn/prefer-event-target': 'off',

                '@typescript-eslint/quotes': ['error', 'single', { avoidEscape: true }],
                '@typescript-eslint/no-non-null-assertion': 'off',

                'tailwindcss/classnames-order': 'error',
            },
        },
        {
            // Jest again to overload previous no-restricted-globals
            files: ['**/*.test.ts'],
            rules: {
                'no-restricted-globals': 'off',
            },
        },
        {
            // JS files
            files: ['*.js', '*.jsx', '*.cjs', '*.mjs'],
            extends: ['prettier'],
            rules: {
                'object-shorthand': ['error', 'always'],

                'unicorn/no-null': 'off',
                'unicorn/prevent-abbreviations': 'off',
                'unicorn/prefer-module': 'off',
                'unicorn/prefer-top-level-await': 'off',
            },
        },
    ],
});
