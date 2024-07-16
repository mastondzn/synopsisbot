import type { BuildColumns, BuildExtraConfigColumns } from 'drizzle-orm';
import {
    type PgColumnBuilderBase,
    type PgTableExtraConfig,
    type PgTableWithColumns,
    pgTable,
} from 'drizzle-orm/pg-core';

import { columns } from './columns';

export const defaults = {
    createdAt: columns.timestamp('created_at').notNull().defaultNow(),
    updatedAt: columns
        .timestamp('updated_at')
        .notNull()
        .defaultNow()
        .$onUpdate(() => new Date()),
};

export function table<
    TTableName extends string,
    TColumnsMap extends Record<string, PgColumnBuilderBase>,
>(
    name: TTableName,
    columns: TColumnsMap,
    extraConfig?: (
        self: BuildExtraConfigColumns<TTableName, TColumnsMap, 'pg'>,
    ) => PgTableExtraConfig,
): PgTableWithColumns<{
    name: TTableName;
    schema: undefined;
    columns: BuildColumns<TTableName, TColumnsMap & typeof defaults, 'pg'>;
    dialect: 'pg';
}> {
    return pgTable(name, { ...columns, ...defaults }, extraConfig);
}
