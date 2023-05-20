import { type Database, makeDatabase } from '@synopsis/db';
import { env } from '@synopsis/env/next';

let cachedDb: Database | undefined;

export const getDb = (): Database => {
    if (!cachedDb) {
        const { db } = makeDatabase({
            host: env.DB_HOST,
            user: env.DB_USERNAME,
            password: env.DB_PASSWORD,
            database: env.DB_NAME,
            logger: true,
        });

        cachedDb = db;
    }
    return cachedDb;
};
