'use client';

import { IconMoon, IconSun } from '@tabler/icons-react';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

import { Button, type ButtonProps } from './button';

export function ThemeSwitch({ ...props }: Omit<ButtonProps, 'children'>) {
    const [mounted, setMounted] = useState(false);
    const { theme, setTheme } = useTheme();

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return (
            <Button {...props}>
                <IconMoon className="h-6 w-6" />
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
            {theme === 'dark' ? ( //
                <IconMoon className="h-6 w-6" />
            ) : theme === 'light' ? (
                <IconSun className="h-6 w-6" />
            ) : null}
        </Button>
    );
}
