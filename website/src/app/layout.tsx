import '~/globals.css';

import { ThemeProvider } from '~/components/theme';
import { fontSans } from '~/utils/fonts';
import { tw } from '~/utils/tw';

export const metadata = {
    title: 'Synopsis Bot',
    description: 'A twitch bot for having fun in chat.',
    icons: {
        icon: '/favicon.ico',
        apple: '/apple-touch-icon.png',
    },
    themeColor: [
        { media: '(prefers-color-scheme: light)', color: 'white' },
        { media: '(prefers-color-scheme: dark)', color: 'black' },
    ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <>
            <html lang="en" suppressHydrationWarning>
                <head />
                <body
                    className={tw(
                        'min-h-screen bg-background font-sans antialiased',
                        fontSans.variable
                    )}
                >
                    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
                        <div className="relative flex min-h-screen flex-col">
                            <div className="flex-1">{children}</div>
                        </div>
                    </ThemeProvider>
                </body>
            </html>
        </>
    );
}
