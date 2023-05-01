import { IconBrandGithub, IconBrandTwitch, IconMail } from '@tabler/icons-react';
import Image from 'next/image';
import Link from 'next/link';

import synopsisWhite from '../../public/synopsiswhite.png';
import { Button } from '~/components/button';

export default function IndexPage() {
    return (
        <div className="container flex min-h-screen flex-col items-center justify-center gap-6">
            <Image src={synopsisWhite} alt="synopsisbot logo" className="w-[500px]" />
            <h2 className="scroll-m-20 pb-2 text-3xl font-semibold tracking-tight transition-colors first:mt-0">
                {'Website is currently under construction ⛏️'}
            </h2>
            <div className="flex flex-row gap-10">
                <Link href="https://twitch.tv/synopsisbot" target="_blank" rel="noreferrer">
                    <Button size="lg" className="h-fit w-fit px-3 py-3">
                        <IconBrandTwitch className="h-8 w-8" />{' '}
                    </Button>
                </Link>
                <Link href="https://github.com/synopsisgg/bot" target="_blank" rel="noreferrer">
                    <Button size="lg" className="h-fit w-fit px-3 py-3">
                        <IconBrandGithub className="h-8 w-8" />{' '}
                    </Button>
                </Link>
                <Link href="mailto:contact@synopsis.gg" target="_blank" rel="noreferrer">
                    <Button size="lg" className="h-fit w-fit px-3 py-3">
                        <IconMail className="h-8 w-8" />
                    </Button>
                </Link>
            </div>
        </div>
    );
}
