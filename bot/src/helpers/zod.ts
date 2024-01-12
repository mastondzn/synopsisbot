import { z } from 'zod';

export const channelSchema = z
    .string()
    .regex(/^#?\w+$/i)
    .transform(v => v.replace(/^#+/, ''));
