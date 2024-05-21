'use client';

import { IconMoon, IconSun } from '@tabler/icons-react';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

import { Button, type ButtonProperties } from './button';
import { Skeleton } from './skeleton';

export function ThemeSwitch({ ...props }: Omit<ButtonProperties, 'children'>) {
    const [mounted, setMounted] = useState(false);
    const { theme, setTheme } = useTheme();

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return (
            <Button {...props}>
                <Skeleton className="size-6 rounded-full" />
            </Button>
        );
    }

    return (
        <Button
            {...props}
            onClick={() => {
                if (theme === 'dark') {
                    setTheme('light');
                } else if (theme === 'light') {
                    setTheme('dark');
                }
            }}
        >
            {theme === 'dark' ? (
                <IconMoon className="size-6" />
            ) : theme === 'light' ? (
                <IconSun className="size-6" />
            ) : null}
        </Button>
    );
}
