import { migrate } from '@synopsis/db/migrator';

import { type DatabaseScript } from '~/types/scripts';

export const script: DatabaseScript = {
    description: 'run drizzle database migrations',
    type: 'db',
    run: async ({ db }) => {
        await migrate(db, { migrationsFolder: './migrations' });
    },
};
