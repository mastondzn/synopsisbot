import { defineConfig } from '@mastondzn/eslint';

export default defineConfig({}, {
    rules: {
        'import/order': ['error', {
            'alphabetize': {
                caseInsensitive: true,
                order: 'asc',
            },
            'groups': [
                'builtin',
                'external',
                ['internal', 'parent', 'sibling', 'index'],
            ],
            'newlines-between': 'always',
            'pathGroups': [
                {
                    group: 'internal',
                    pattern: '~/**',
                },
            ],
        }],
    },
});
