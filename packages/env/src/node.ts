/// <reference types="node" />

import { parseEnv } from 'znv';

import { environmentSchema } from './schemas';

// eslint-disable-next-line unicorn/prevent-abbreviations
export const env = parseEnv(process.env, environmentSchema.shape);
