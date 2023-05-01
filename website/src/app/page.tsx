import { IconBrandGithub, IconBrandTwitch, IconMail } from '@tabler/icons-react';
import Image from 'next/image';
import Link from 'next/link';

import synopsisWhite from '../../public/synopsiswhite.png';
import { Button } from '~/components/button';

export default function Page() {
    return (
        <div className="container flex min-h-screen flex-col items-center justify-center gap-3">
            <Image src={synopsisWhite} className="mb-2 w-[500px]" alt="" />
            <h2 className="scroll-m-20 pb-2 text-xl font-semibold tracking-tight transition-colors first:mt-0">
                {'Website is currently under construction ⛏️'}
            </h2>
            <div className="flex flex-row gap-10">
                {[
                    { link: 'https://twitch.tv/synopsisbot', Icon: IconBrandTwitch },
                    { link: 'https://github.com/synopsisgg/bot', Icon: IconBrandGithub },
                    { link: 'mailto:contact@synopsis.gg', Icon: IconMail },
                ].map(({ link, Icon }, i) => (
                    <Link href={link} target="_blank" rel="noreferrer" key={i}>
                        <Button variant="outline" size="lg" className="h-fit w-fit px-5 py-3">
                            <Icon className="h-6 w-6" />
                        </Button>
                    </Link>
                ))}
            </div>
        </div>
    );
}
