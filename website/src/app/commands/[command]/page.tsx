import { redirect } from 'next/navigation';

import { PageBase } from '~/components/page-base';
import { Separator } from '~/components/separator';
import { getDb } from '~/utils/db';
import { tw } from '~/utils/tw';

export const revalidate = 3600;

async function getCommand(name: string) {
    const db = getDb();
    const command = await db.query.commands.findFirst({
        where: ({ name: nameField }, { eq }) => eq(nameField, name),
    });
    return command ?? null;
}

export default async function Page({ params }: { params: { command: string } }) {
    const command = await getCommand(params.command);

    if (!command) {
        return redirect('/404');
    }

    const usage = (
        command.usage
            ? command.usage.split('\n')
            : ['No special usage instructions. Use as normal.']
    )
        .map((line) => line.trim())
        .map((line) => ({
            line,
            isExample: line.startsWith(command.name),
        }));

    return (
        <PageBase>
            <div className="max-w-[500px]">
                <div className="space-y-1">
                    <h4 className="font-bold text-3xl pb-2 leading-none">{command.name}</h4>
                    <p className="text-lg">{command.description ?? 'No command description.'}</p>
                </div>
                <Separator className="my-4" />
                <h4 className="font-medium text-lg">Usage</h4>
                {usage.map(({ line, isExample }, i) => {
                    return isExample ? (
                        <p key={i} className={tw('font-semibold text-primary pt-2')}>
                            {line}
                        </p>
                    ) : (
                        <p key={i} className={i === 0 ? 'pt-2' : ''}>
                            {line}
                        </p>
                    );
                })}
                <Separator className="my-4" />
                <h4 className="font-medium text-lg mb-2">Aliases</h4>
                <p>
                    {command.aliases?.length
                        ? command.aliases.join(', ')
                        : 'No additional command aliases.'}
                </p>
                <Separator className="my-4" />
                <h4 className="font-medium text-lg mb-2">Permissions</h4>
                <p>
                    {command.permissionMode === 'custom'
                        ? 'This command has custom permissions. That means depending on its usage, it may require different permissions.'
                        : command.permissionMode === 'all'
                        ? `Requires ${command.localPermission} local level and ${command.globalPermission} global level.`
                        : `Requires ${command.localPermission} local level or ${command.globalPermission} global level.`}
                </p>
                <Separator className="my-4" />
                <h4 className="font-medium text-lg mb-2">Cooldown</h4>
                <p>{`User cooldown: ${command.userCooldown} seconds`}</p>
                <p>{`Global cooldown: ${command.globalCooldown} seconds`}</p>
            </div>
        </PageBase>
    );
}
