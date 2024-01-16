import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const dirname = fileURLToPath(new URL('.', import.meta.url));

/** @satisfies {import("next").NextConfig} */
const config = {
    reactStrictMode: true,
    transpilePackages: ['@synopsis/db', '@synopsis/scopes', '@synopsis/env'],
    output: 'standalone',
    experimental: {
        outputFileTracingRoot: join(dirname, '../'),
    },
};

export default config;
