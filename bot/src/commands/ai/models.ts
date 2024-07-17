import { createOpenAI } from '@ai-sdk/openai';
import { env } from '@synopsis/env/node';

import { FeatureNotAvailableError } from '~/errors/no-feature';

export const models = {
    'google/gemma-2-27b-it': ['gemma', 'gemma-m', 'gemma-medium'],
    'google/gemma-2-9b-it': ['gemma-s', 'gemma-small'],
    'qwen/qwen-2-72b-instruct': ['qwen', 'qwen-m', 'qwen-medium'],
    'qwen/qwen-2-7b-instruct': ['qwen-s', 'qwen-small'],
    'meta-llama/llama-3-70b-instruct': ['llama', 'llama-m', 'llama-medium'],
    'meta-llama/llama-3-8b-instruct': ['llama-s', 'llama-small'],
} as const satisfies Record<string, string[]>;

export const DEFAULT_MODEL = 'google/gemma-2-27b-it' satisfies keyof typeof models;

export type Models = typeof models;
export type ModelName = keyof Models;
export type ModelAlias = Models[keyof Models][number];
export type ModelIdentifier = ModelName | ModelAlias;

export function openrouter(model: ModelName) {
    if (!env.OPENROUTER_API_KEY) {
        throw new FeatureNotAvailableError({
            message: 'AI command is not available without an API key.',
        });
    }

    const provider = createOpenAI({
        baseURL: 'https://openrouter.ai/api/v1',
        apiKey: env.OPENROUTER_API_KEY,
        headers: {
            'HTTP-Referer': `https://bot.${env.DOMAIN_NAME}`,
            'X-Title': env.NODE_ENV === 'production' ? 'synopsisbot' : 'synopsisbot development',
        },
    });

    return provider(model);
}
