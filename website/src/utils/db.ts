import { createDatabase, type Database } from '@synopsis/db';
import { env } from '@synopsis/env/next';

let cachedDb: Database | undefined;

export const getDb = (): Database => {
    if (!cachedDb) {
        const { db } = createDatabase({
            host: env.DB_HOST,
            user: env.DB_USERNAME,
            password: env.DB_PASSWORD,
            database: env.DB_NAME,
        });

        cachedDb = db;
    }
    return cachedDb;
};
