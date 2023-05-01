const path = require('node:path');

/** @type {import("next").NextConfig} */
const config = {
    reactStrictMode: true,
    output: 'standalone',
    transpilePackages: ['@synopsis/db', '@synopsis/env', '@synopsis/scopes'],
    webpack: (config, { webpack }) => {
        config.plugins.push(
            new webpack.IgnorePlugin({
                resourceRegExp: /pg-native/,
                contextRegExp: /\/pg\//,
            })
        );
        return config;
    },
    experimental: {
        outputFileTracingRoot: path.join(__dirname, '../'),
        appDir: true,
    },
};

module.exports = config;
