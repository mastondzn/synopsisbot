import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
    overwrite: true,
    schema: 'https://7tv.io/v3/gql',
    documents: 'src/**/*.ts',

    generates: {
        'src/7tv/sdk.ts': {
            plugins: [
                'typescript',
                'typescript-operations',
                'typescript-graphql-request',
                { add: { placement: 'prepend', content: '/* eslint-disable */' } },
            ],
            hooks: {
                afterOneFileWrite: ['prettier --write'],
            },
            config: {
                gqlImport: 'graphql-request#gql',
            },
        },
    },
};

export default config;
