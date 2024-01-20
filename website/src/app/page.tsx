import Link from 'next/link';

import { Button } from '~/components/button';
import { PageBase } from '~/components/page-base';

export default function Page() {
    return (
        <PageBase>
            <h2 className="max-w-[550px] text-center text-xl font-medium">
                {
                    "Hello! Synopsis Bot is a Twitch chat bot with a limited set of commands. But it's in development and growing!"
                }
            </h2>
            <p className="mt-[-20px] max-w-[400px] text-center">
                {'Currently, you cannot add the bot to a channel yourself, you can ask '}
                <Link
                    href="https://twitch.tv/mastondzn"
                    target="_blank"
                    className="text-blue-700 dark:text-blue-500"
                >
                    {'me '}
                </Link>
                {'to add it for you though, or you can '}
                <Link
                    href="https://www.twitch.tv/popout/synopsisbot/chat"
                    target="_blank"
                    className="text-blue-700 dark:text-blue-500"
                >
                    {"try it out in the bot's twitch chat"}
                </Link>
                .
            </p>
            <Link href="/commands">
                <Button variant="default">
                    <p className="font-semibold">✨ See the available commands!</p>
                </Button>
            </Link>
        </PageBase>
    );
}
