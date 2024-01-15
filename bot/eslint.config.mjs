import { defineConfig } from '@mastondzn/eslint';

export default defineConfig({
    typescript: {
        tsconfigPath: './tsconfig.json',
    },

    javascript: {
        overrides: {
            'no-console': 'off',
        },
    },
});
