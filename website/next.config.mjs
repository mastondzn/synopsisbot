//@ts-check

import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

// set process.env.SKIP_ENV_VALIDATION to something to skip validation
import '@synopsis/env/next';

const __dirname = dirname(fileURLToPath(import.meta.url));

/** @type {import("next").NextConfig} */
const config = {
    reactStrictMode: true,
    output: 'standalone',
    transpilePackages: ['@synopsis/db', '@synopsis/scopes'],
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
        outputFileTracingRoot: join(__dirname, '../'),
        appDir: true,
    },
};

export default config;
