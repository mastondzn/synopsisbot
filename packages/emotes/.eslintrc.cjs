const { defineConfig } = require('eslint-define-config');

module.exports = defineConfig({
    extends: [require.resolve('@synopsis/eslint-config')],
    ignorePatterns: ['node_modules', 'dist', 'coverage', 'build'],
});
