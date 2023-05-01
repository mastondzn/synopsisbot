export const metadata = {
    title: 'Synopsis Bot',
    description: 'A twitch bot for having fun in chat.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
            <body>{children}</body>
        </html>
    );
}
