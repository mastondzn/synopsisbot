// @ts-check
const { defineConfig } = require('eslint-define-config');
const fs = require('node:fs');

/** @type {import('type-fest').PackageJson} */
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const hasReact = packageJson.dependencies?.react !== undefined;

console.log(process.cwd());

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
            // Jest
            files: ['**/*.test.ts'],
            settings: {
                jest: {
                    version: 28,
                },
            },
            env: {
                jest: true,
            },
            plugins: ['jest'],
            extends: ['plugin:jest/recommended', 'plugin:jest/style'],
        },
        {
            // TS files
            files: ['*.ts', '*.tsx'],
            parser: '@typescript-eslint/parser',
            parserOptions: {
                project: `${process.cwd()}/tsconfig.json`,
            },
            plugins: ['simple-import-sort', '@typescript-eslint'],
            extends: (() => {
                let configs = [
                    'plugin:import/typescript',
                    'plugin:@typescript-eslint/recommended',
                    'plugin:@typescript-eslint/recommended-requiring-type-checking',
                ];

                if (hasReact) {
                    configs = [
                        ...configs,
                        'plugin:react/recommended',
                        'plugin:react/jsx-runtime',
                        'plugin:react-hooks/recommended',
                    ];
                }

                configs.push('prettier');

                return configs;
            })(),
            settings: {
                react: {
                    version: 'detect',
                },
                'import/resolver': {
                    typescript: true,
                    node: true,
                },
            },
            rules: {
                // Prefer shorthand object notation
                'object-shorthand': ['error', 'always'],

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
                            // Absolute imports and other imports such as Vue-style `@/foo`.
                            // Anything not matched in another group.
                            [String.raw`^`, String.raw`^[^.].*\u0000$`],
                            // Relative imports.
                            // Anything that starts with a dot.
                            [String.raw`^\.`, String.raw`^\..*\u0000$`],
                            // // Type imports group at the bottom (sorted the same as the groups but in a single group)
                            // [
                            //     String.raw`^node:.*\u0000$`,
                            //     String.raw`^@?\w.*\u0000$`,
                            //     String.raw`^@synopsis/.*\u0000$`,
                            //     String.raw`^[^.].*\u0000$`,
                            //     String.raw`^\..*\u0000$`,
                            // ],
                        ],
                    },
                ],

                '@typescript-eslint/consistent-type-imports': [
                    'error',
                    {
                        prefer: 'type-imports',
                        disallowTypeAnnotations: true,
                        fixStyle: 'inline-type-imports',
                    },
                ],
                '@typescript-eslint/no-misused-promises': [
                    'error',
                    {
                        checksVoidReturn: false,
                    },
                ],

                'unicorn/no-null': 'off',
                'unicorn/prevent-abbreviations': 'off',
                'unicorn/prefer-module': 'off',
                'unicorn/prefer-top-level-await': 'off',

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
