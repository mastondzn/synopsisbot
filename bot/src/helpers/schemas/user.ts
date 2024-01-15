import { z } from 'zod';

export const userSchema = z
    .string()
    .regex(/^#?\w+$/i)
    .transform(v => v.replace(/^#+/, ''));
