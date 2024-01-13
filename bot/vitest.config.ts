import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { defineConfig } from 'vitest/config';

export default defineConfig({
    resolve: {
        alias: { '~': resolve(dirname(fileURLToPath(import.meta.url)), './src') },
    },
});
