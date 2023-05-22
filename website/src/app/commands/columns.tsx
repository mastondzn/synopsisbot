'use client';

import { type ColumnDef } from '@tanstack/react-table';

export interface Command {
    name: string;
    description: string;
    aliases: string;
}

export const columns: ColumnDef<Command>[] = [
    {
        accessorKey: 'name',
        header: () => <div>{'Name'}</div>,
    },
    {
        accessorKey: 'description',
        header: () => <div>{'Description'}</div>,
    },
    {
        accessorKey: 'aliases',
        header: () => <div>{'Aliases'}</div>,
    },
];
