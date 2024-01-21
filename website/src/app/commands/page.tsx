import { columns } from './columns';
import { DataTable } from './table';
import { PageBase } from '~/components/page-base';
import { rpcClient } from '~/utils/rpc';

export const revalidate = 600;
export const dynamic = 'force-dynamic';

export default async function Page() {
    const response = await rpcClient.commands.$get();
    const json = await response.json();
    const commands = json.data.sort((a, b) => a.name.localeCompare(b.name));

    return (
        <PageBase>
            <DataTable columns={columns} data={commands} />
        </PageBase>
    );
}
