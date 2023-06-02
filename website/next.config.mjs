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
    experimental: {
        outputFileTracingRoot: join(__dirname, '../'),
    },
};

export default config;
