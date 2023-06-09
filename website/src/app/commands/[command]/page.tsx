import { redirect } from 'next/navigation';

import { PageBase } from '~/components/page-base';
import { Separator } from '~/components/separator';
import { getDb } from '~/utils/db';
import { tw } from '~/utils/tw';

export const revalidate = 3600;

async function getCommand(wanted: string) {
    const db = getDb();
    const command = await db.query.commands.findFirst({
        where: ({ name }, { eq }) => eq(name, wanted),
    });
    return command ?? null;
}

export default async function Page({ params }: { params: { command: string } }) {
    const command = await getCommand(params.command);

    if (!command) {
        return redirect('/404');
    }

    const usage = command.usage?.split('\n').map((line) => ({
        line: line.trim(),
        isExample: line.startsWith(command.name),
    })) ?? [{ line: 'No special usage instructions. Use as normal.', isExample: false }];

    return (
        <PageBase>
            <div className="max-w-[500px]">
                <div className="space-y-1">
                    <h4 className="pb-2 text-3xl font-bold leading-none">{command.name}</h4>
                    <p className="text-lg">{command.description ?? 'No command description.'}</p>
                </div>
                <Separator className="my-4" />
                <h4 className="text-lg font-medium">Usage</h4>
                {usage.map(({ line, isExample }, i) => {
                    return isExample ? (
                        <p key={i} className={tw('pt-2 font-semibold text-primary')}>
                            {line}
                        </p>
                    ) : (
                        <p key={i} className={i === 0 ? 'pt-2' : ''}>
                            {line}
                        </p>
                    );
                })}
                <Separator className="my-4" />
                <h4 className="mb-2 text-lg font-medium">Aliases</h4>
                <p>
                    {command.aliases?.length
                        ? command.aliases.join(', ')
                        : 'No additional command aliases.'}
                </p>
                <Separator className="my-4" />
                <h4 className="mb-2 text-lg font-medium">Permissions</h4>
                <p>
                    {command.permissionMode === 'custom'
                        ? 'This command has custom permissions. That means depending on its usage, it may require different permissions.'
                        : command.permissionMode === 'all'
                        ? `Requires ${command.localPermission} local level and ${command.globalPermission} global level.`
                        : `Requires ${command.localPermission} local level or ${command.globalPermission} global level.`}
                </p>
                <Separator className="my-4" />
                <h4 className="mb-2 text-lg font-medium">Cooldown</h4>
                <p>{`User cooldown: ${command.userCooldown} seconds`}</p>
                <p>{`Global cooldown: ${command.globalCooldown} seconds`}</p>
            </div>
        </PageBase>
    );
}
