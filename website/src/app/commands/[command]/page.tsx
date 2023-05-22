import { redirect } from 'next/navigation';

import { getDb } from '~/utils/db';

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

    return <div>{command.name}</div>;
}
