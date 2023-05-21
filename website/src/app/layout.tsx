import '~/globals.css';

import { Providers } from './providers';
import { fontSans } from '~/utils/fonts';
import { tw } from '~/utils/tw';

export const metadata = {
    title: 'Synopsis Bot',
    description: 'A twitch bot for having fun in chat.',
    icons: {
        icon: '/favicon.ico',
        shortcut: '/favicon-16x16.png',
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
                    <div className="relative flex min-h-screen flex-col">
                        <div className="flex-1">
                            <Providers>{children}</Providers>
                        </div>
                    </div>
                </body>
            </html>
        </>
    );
}
