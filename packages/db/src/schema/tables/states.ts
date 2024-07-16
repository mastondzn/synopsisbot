import type { InferInsertModel, InferSelectModel } from 'drizzle-orm';

import { columns, table } from '../utils';

export const states = table('auth_states', {
    state: columns.varchar('state', { length: 64 }).primaryKey(),
});

export type State = InferSelectModel<typeof states>;
export type NewState = InferInsertModel<typeof states>;
