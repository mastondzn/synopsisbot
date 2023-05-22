import Link from 'next/link';

import { Button } from '~/components/button';
import { PageBase } from '~/components/page-base';

export default function Page() {
    return (
        <PageBase>
            <h2 className="text-xl font-medium text-center max-w-[600px]">
                {
                    "Hello! Synopsis Bot is a Twitch chat bot with a limited set of commands. But it's in development and growing!"
                }
            </h2>
            <p className="text-center max-w-[400px] mt-[-20px]">
                Currently, you cannot add the bot to a channel yourself, you can ask{' '}
                <Link
                    href="https://twitch.tv/mastondzn"
                    target="_blank"
                    className="dark:text-blue-500 text-blue-900"
                >
                    me
                </Link>{' '}
                to add it for you though!
            </p>
            <Link href="/commands">
                <Button variant="default">
                    <p className="font-semibold">{'✨ See the available commands!'}</p>
                </Button>
            </Link>
        </PageBase>
    );
}
