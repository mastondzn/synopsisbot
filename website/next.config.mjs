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
