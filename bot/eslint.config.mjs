import { defineConfig } from '@mastondzn/eslint';

export default defineConfig({
    stylistic: false,

    typescript: {
        tsconfigPath: './tsconfig.json',
    },

    rules: {
        'no-console': 'off',
        'unicorn/prevent-abbreviations': [
            'error',
            {
                allowList: {
                    args: true,
                    fn: true,
                    db: true,
                },
            },
        ],
    },
});
