import type { z } from 'zod';

import type { Command } from './types';

export function defineCommand<
    TOptions extends z.ZodRawShape = z.ZodRawShape,
>(command: Command<TOptions>) {
    return command;
};
