//@ts-check

// set process.env.SKIP_ENV_VALIDATION to something to skip validation
import '@synopsis/env';

/** @type {import("next").NextConfig} */
const config = {
    reactStrictMode: true,
    transpilePackages: ['@synopsis/db', '@synopsis/scopes'],
};

export default config;
