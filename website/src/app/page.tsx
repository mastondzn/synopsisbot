import { IconBrandGithub, IconBrandTwitch, IconMail, IconMoonOff } from '@tabler/icons-react';
import Image from 'next/image';
import Link from 'next/link';

import synopsisBlack from '../../public/synopsisblack.png';
import { Button } from '~/components/button';
import { ThemeSwitcher } from '~/components/theme-switch';

export default function Page() {
    return (
        <div className="container flex min-h-screen flex-col items-center justify-center gap-3">
            <Image src={synopsisBlack} className="mb-2 w-[500px] dark:invert" alt="" />
            <h2 className="scroll-m-20 pb-2 text-xl font-semibold tracking-tight transition-colors first:mt-0 text-center">
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
                <ThemeSwitcher variant="outline" className="h-fit w-fit px-5 py-3">
                    <IconMoonOff className="h-6 w-6" />
                </ThemeSwitcher>
            </div>
        </div>
    );
}
