// set process.env.SKIP_ENV_VALIDATION to something to skip validation

import { fileURLToPath } from 'node:url';

import jiti from 'jiti';

const filename = fileURLToPath(import.meta.url);
const environmentPath = fileURLToPath(import.meta.resolve('@synopsis/env/next'));
jiti(filename)(environmentPath);

/** @satisfies {import("next").NextConfig} */
const config = {
    reactStrictMode: true,
    transpilePackages: ['@synopsis/db', '@synopsis/scopes', '@synopsis/env'],
};

export default config;
