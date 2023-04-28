import { Box, Center, IconButton, Text, useColorMode } from '@chakra-ui/react';
import { type NextPage } from 'next';
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';

import synopsisBlack from '../../public/synopsisblack.png';
import synopsisWhite from '../../public/synopsiswhite.png';
import { EmailIcon, GitHubIcon, TwitchIcon } from '~/components/icons';

const Home: NextPage = () => {
    const { colorMode } = useColorMode();

    return (
        <>
            <Head>
                <title>Synopsis Bot</title>
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <Center h="100vh" flexDirection="column" gap="20px">
                <Image
                    src={colorMode === 'dark' ? synopsisWhite : synopsisBlack}
                    alt="bot logo"
                    width="400"
                />
                <Text size="xl">Website is currently under construction ⛏️</Text>
                <Box display="flex" flexDirection="row" gap={6}>
                    <Link href="https://twitch.tv/synopsisbot" target="_blank">
                        <IconButton
                            aria-label="go to bot on twitch"
                            icon={<TwitchIcon boxSize={8} />}
                            size="lg"
                        />
                    </Link>
                    <Link href="https://github.com/synopsisgg/bot" target="_blank">
                        <IconButton
                            aria-label="go to bot on github"
                            icon={<GitHubIcon boxSize={8} />}
                            size="lg"
                        />
                    </Link>
                    <Link href="mailto:contact@synopsis.gg" target="_blank">
                        <IconButton
                            aria-label="email contact"
                            icon={<EmailIcon boxSize={8} />}
                            size="lg"
                        />
                    </Link>
                </Box>
            </Center>
        </>
    );
};

export default Home;
