import { columns } from './columns';
import { DataTable } from './table';
import { PageBase } from '~/components/page-base';
import { getDb } from '~/utils/db';

export const revalidate = 600;
export const dynamic = 'force-dynamic';

async function getCommands() {
    const db = getDb();
    const dbCommands = await db.query.commands.findMany();

    return dbCommands
        .map((command) => ({
            name: command.name,
            description: command.description ?? '-',
            aliases: command.aliases?.length ? command.aliases.join(', ') : '-',
        }))
        .sort((a, b) => a.name.localeCompare(b.name));
}

export default async function Page() {
    const commands = await getCommands();

    return (
        <PageBase>
            <DataTable columns={columns} data={commands} />
        </PageBase>
    );
}
