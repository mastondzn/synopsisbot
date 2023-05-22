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
        return <div>Command not found</div>;
    }

    return <div>{command.name}</div>;
}
