'use client';

import Image from 'next/image';
import { useTheme } from 'next-themes';
import type { ComponentProps } from 'react';

type ImageProperties = ComponentProps<typeof Image>;
type SourceProperty = ImageProperties['src'];

export function ThemedImage({
    light,
    dark,
    ...props
}: Omit<ImageProperties, 'src'> & { light: SourceProperty, dark: SourceProperty }) {
    const { theme } = useTheme();

    const source
        = theme === 'dark' //
            ? dark
            : (theme === 'light'
                    ? light
                    : undefined);

    if (!source) {
        throw new TypeError('Invalid theme from \'useTheme()\'');
    }

    // eslint-disable-next-line jsx-a11y/alt-text
    return <Image {...props} src={source} />;
}
