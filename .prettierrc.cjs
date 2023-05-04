/** @satisfies {import('prettier').Options} */
const config = {
    arrowParens: 'always',
    bracketSpacing: true,
    endOfLine: 'lf',
    insertPragma: false,
    jsxSingleQuote: false,
    printWidth: 100,
    proseWrap: 'preserve',
    quoteProps: 'as-needed',
    requirePragma: false,
    semi: true,
    singleQuote: true,
    tabWidth: 4,
    trailingComma: 'es5',
    useTabs: false,
    plugins: [],
};

if (process.cwd().includes('website')) {
    config.tailwindConfig = './tailwind.config.js';
    config.plugins.push(require('prettier-plugin-tailwindcss'));
}

module.exports = config;
