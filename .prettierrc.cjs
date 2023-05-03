// @ts-check

const plugins = [];
if (process.cwd().includes('website')) {
    plugins.push(require('prettier-plugin-tailwindcss'));
}

/** @type {import('prettier').Options} */
module.exports = {
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

    plugins,
    tailwindConfig: './website/tailwind.config.js',
};
