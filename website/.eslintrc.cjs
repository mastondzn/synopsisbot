// eslint-disable-next-line @typescript-eslint/no-var-requires
const { defineConfig } = require('eslint-define-config');

module.exports = defineConfig({
    extends: ['next/core-web-vitals', require.resolve('@synopsis/eslint-config')],
    ignorePatterns: ['node_modules', 'dist', 'coverage', 'build'],
    rules: {
        '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
        'turbo/no-undeclared-env-vars': 'warn',
    },
});
