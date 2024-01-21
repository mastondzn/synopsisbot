'use client';

import type { ColumnDef } from '@tanstack/react-table';
import Link from 'next/link';

export interface Command {
    name: string;
    description: string;
    aliases: string[] | undefined;
}

function Linked({ name, children }: { name: string; children: React.ReactNode }) {
    return <Link href={`/commands/${name}`}>{children}</Link>;
}

export const columns: ColumnDef<Command>[] = [
    {
        accessorKey: 'name',
        header: () => 'Name',
        cell: ({ row }) => {
            const name = row.getValue<string>('name');

            return (
                <Linked name={name}>
                    <p className="px-4 py-3 font-bold text-blue-900 dark:text-blue-500">{name}</p>
                </Linked>
            );
        },
    },
    {
        accessorKey: 'description',
        header: () => 'Description',
        cell: ({ row }) => {
            const name = row.getValue<string>('name');

            return (
                <Linked name={name}>
                    <p className="px-4 py-3">{row.getValue<string>('description')}</p>
                </Linked>
            );
        },
    },
    {
        accessorKey: 'aliases',
        header: () => 'Aliases',
        cell: ({ row }) => {
            const name = row.getValue<string>('name');
            const aliases = row.getValue<string[] | undefined>('aliases');

            return (
                <Linked name={name}>
                    <p className="px-4 py-3">{aliases?.length ? aliases.join(', ') : '-'}</p>
                </Linked>
            );
        },
    },
];
