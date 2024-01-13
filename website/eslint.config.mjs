import { defineConfig } from '@mastondzn/eslint';

export default defineConfig({
    typescript: {
        tsconfigPath: './tsconfig.json',
    },

    tailwindcss: {
        tags: [],
        callees: ['cva', 'cn', 'clsx'],
        config: './tailwind.config.cjs',
    },
});
