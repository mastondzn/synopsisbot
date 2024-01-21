import { notFound } from 'next/navigation';

import { PageBase } from '~/components/page-base';
import { Separator } from '~/components/separator';
import { rpcClient } from '~/utils/rpc';
import { twx } from '~/utils/tailwind';

export const revalidate = 3600;

const H3 = twx.h3`mb-2 text-lg font-medium`;

export default async function Page({ params }: { params: { command: string } }) {
    const response = await rpcClient.commands.$get();
    const json = await response.json();
    const command = json.data.find((command) => command.name === params.command);

    if (!command) {
        return notFound();
    }

    const cooldownText = command.cooldown
        ? `You'll be on cooldown for ${command.cooldown} seconds.`
        : "You'll be on cooldown for the default amount.";

    return (
        <PageBase>
            <div className="max-w-[500px]">
                <div className="space-y-1">
                    <h1 className="pb-2 text-3xl font-bold leading-none">{command.name}</h1>
                    <h2 className="text-lg">{command.description}</h2>
                </div>
                <Separator className="my-4" />
                <H3 className="mb-2 text-lg font-medium">Usage</H3>
                <div className="flex flex-col gap-1">
                    {command.usage?.map(([example, line], index) => {
                        return (
                            <div className="gap-2" key={index}>
                                <p className="font-semibold text-primary">{example}</p>
                                <p>{line}</p>
                            </div>
                        );
                    }) ?? (
                        <p className="my-2">
                            {'No special usage instructions for this command. Use it normally.'}
                        </p>
                    )}
                </div>
                <Separator className="my-4" />
                <H3 className="mb-2 text-lg font-medium">Aliases</H3>
                <p>
                    {command.aliases?.length ? command.aliases.join(', ') : 'No command aliases.'}
                </p>
                <Separator className="my-4" />
                <H3 className="mb-2 text-lg font-medium">Cooldown</H3>
                <p>{cooldownText}</p>
            </div>
        </PageBase>
    );
}
