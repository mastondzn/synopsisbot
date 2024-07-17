import { z } from 'zod';

export const boolean = z.string().transform<boolean>((value, { addIssue }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    if (value === '1') return true;
    if (value === '0') return false;

    addIssue({
        message: `Invalid boolean value "${value}".`,
        code: z.ZodIssueCode.custom,
    });
    return z.NEVER;
});
