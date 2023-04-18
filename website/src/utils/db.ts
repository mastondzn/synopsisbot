import { makeDatabase } from '@synopsis/db';

import { env } from '~/env.mjs';

export const { db, pool } = makeDatabase(env);
