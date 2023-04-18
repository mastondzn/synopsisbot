import { resolve } from 'node:path';

import { config } from 'dotenv';

import { parseEnv } from '@synopsis/env';

config({ path: resolve(process.cwd(), '../.env') });

export const env = parseEnv(process.env);
