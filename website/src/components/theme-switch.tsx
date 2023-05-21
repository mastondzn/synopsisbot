'use client';

import { useTheme } from 'next-themes';

import { Button, type ButtonProps } from './button';

export function ThemeSwitcher(props: ButtonProps) {
    const { theme, setTheme } = useTheme();

    return (
        <Button
            {...props}
            onClick={() => {
                if (theme === 'dark') {
                    setTheme('light');
                } else {
                    setTheme('dark');
                }
            }}
        />
    );
}
