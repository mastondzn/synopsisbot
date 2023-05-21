'use client';

import Image from 'next/image';
import { useTheme } from 'next-themes';
import { type ComponentProps } from 'react';

type ImageProps = ComponentProps<typeof Image>;
type SrcProp = ImageProps['src'];

export function ThemedImage({
    light,
    dark,
    ...props
}: Omit<ImageProps, 'src'> & { light: SrcProp; dark: SrcProp }) {
    const { theme } = useTheme();

    const src =
        theme === 'dark' //
            ? dark
            : theme === 'light'
            ? light
            : undefined;

    if (!src) {
        throw new TypeError("Invalid theme from 'useTheme()'");
    }

    // eslint-disable-next-line jsx-a11y/alt-text
    return <Image {...props} src={src} />;
}
