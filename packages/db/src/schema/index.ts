import * as relations from './relations';
import { tables } from './tables';

export const schema = { ...tables, ...relations };
export type DatabaseSchema = typeof schema;

export * from './relations';
export * from './tables';
