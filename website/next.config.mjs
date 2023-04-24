/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation.
 * This is especially useful for Docker builds.
 */
!process.env.SKIP_ENV_VALIDATION && (await import('./src/env.mjs'));

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
};
export default config;
