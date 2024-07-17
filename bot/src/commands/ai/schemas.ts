import { entries, keys } from 'remeda';
import { z } from 'zod';

import { DEFAULT_MODEL, type ModelName, models } from './models';
import { boolean } from '~/helpers/schemas/boolean';

export const temperature = z.coerce
    .number()
    .min(0)
    .max(2)
    .optional()
    .describe('The temperature to use. The higher it is the more random the output will be.');

export const model = z
    .string()
    .transform<ModelName>((value, { addIssue }) => {
        if (keys(models).includes(value as ModelName)) {
            return value as ModelName;
        }

        for (const [key, aliases] of entries(models)) {
            if ((aliases as string[]).includes(value)) {
                return key;
            }
        }

        addIssue({
            message: `Invalid model "${value}"`,
            code: z.ZodIssueCode.custom,
        });
        return z.NEVER;
    })
    .default(DEFAULT_MODEL)
    .describe(`The AI model to use (defaults to ${DEFAULT_MODEL}).`);

export const system = boolean
    .default('true')
    .describe('Whether to include the system prompt in the response or not.');

export const debug = boolean
    .default('false')
    .describe('Whether to include more information (such as tokens used) in the response or not.');
