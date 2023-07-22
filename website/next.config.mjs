//@ts-check

// set process.env.SKIP_ENV_VALIDATION to something to skip validation
import '@synopsis/env';

/** @type {import("next").NextConfig} */
const config = {
    reactStrictMode: true,
    transpilePackages: ['@synopsis/db', '@synopsis/scopes'],
    webpack: (config, { webpack }) => {
        config.plugins.push(new webpack.IgnorePlugin({ resourceRegExp: /^encoding$/ }));
        return config;
    },
};

export default config;
