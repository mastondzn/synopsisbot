import { type ClassValue, clsx } from 'clsx';
import type React from 'react';
import { type TwcComponentProps, createTwc } from 'react-twc';
import { twMerge } from 'tailwind-merge';

export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));

export const twx = createTwc({ compose: cn });

export type TwxComponentProperties<TComponent extends React.ElementType> = TwcComponentProps<
    TComponent,
    typeof cn
>;
