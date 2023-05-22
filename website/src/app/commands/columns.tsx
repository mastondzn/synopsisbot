'use client';

import { type ColumnDef } from '@tanstack/react-table';
import Link from 'next/link';

export interface Command {
    name: string;
    description: string;
    aliases: string;
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
                    <p className="font-bold dark:text-blue-500 text-blue-900 py-3 px-4">{name}</p>
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
                    <p className="py-3 px-4">{row.getValue<string>('description')}</p>
                </Linked>
            );
        },
    },
    {
        accessorKey: 'aliases',
        header: () => 'Aliases',
        cell: ({ row }) => {
            const name = row.getValue<string>('name');

            return (
                <Linked name={name}>
                    <p className="py-3 px-4">{row.getValue<string>('aliases')}</p>
                </Linked>
            );
        },
    },
];
