'use client';

import * as SeparatorPrimitive from '@radix-ui/react-separator';
import * as React from 'react';

import { tw } from '~/utils/tw';

const Separator = React.forwardRef<
    React.ElementRef<typeof SeparatorPrimitive.Root>,
    React.ComponentPropsWithoutRef<typeof SeparatorPrimitive.Root>
    // eslint-disable-next-line react/prop-types
>(({ className, orientation = 'horizontal', decorative = true, ...props }, reference) => (
    <SeparatorPrimitive.Root
        ref={reference}
        decorative={decorative}
        orientation={orientation}
        className={tw(
            'shrink-0 bg-border',
            orientation === 'horizontal' ? 'h-[1px] w-full' : 'h-full w-[1px]',
            className,
        )}
        {...props}
    />
));
Separator.displayName = SeparatorPrimitive.Root.displayName;

export { Separator };
