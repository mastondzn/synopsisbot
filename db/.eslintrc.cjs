const { defineConfig } = require('eslint-define-config');

module.exports = defineConfig({
    root: true,
    extends: [require.resolve('@synopsis/eslint-config-custom')],
    ignorePatterns: ['node_modules', 'dist', 'coverage', 'build'],
});
