import { ChakraProvider, extendTheme, type ThemeConfig } from '@chakra-ui/react';
import { mode } from '@chakra-ui/theme-tools';
import { type AppType } from 'next/app';
import type { StyleFunctionProps } from '@chakra-ui/styled-system';

import { trpc } from '~/utils/api';

const theme = extendTheme({
    config: {
        initialColorMode: 'dark',
        useSystemColorMode: false,
    },
    styles: {
        global: (props: StyleFunctionProps) => ({
            body: {
                bg: mode('white', 'black')(props),
            },
        }),
    },
});

// eslint-disable-next-line react/prop-types
const MyApp: AppType = ({ Component, pageProps }) => {
    return (
        <ChakraProvider theme={theme}>
            <Component {...pageProps} />
        </ChakraProvider>
    );
};

export default trpc.withTRPC(MyApp);
