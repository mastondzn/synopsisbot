import { defineConfig } from '@mastondzn/eslint';

export default defineConfig({
    stylistic: false,

    typescript: {
        tsconfigPath: './tsconfig.json',
    },

    react: {
        overrides: {
            'react/prop-types': 'off',
        },
    },

    tailwindcss: {
        tags: ['twc', 'twx'],
        callees: ['cva', 'cn', 'clsx'],
        config: './tailwind.config.cjs',
    },
});
