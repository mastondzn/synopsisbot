import { PrismaClient } from '@prisma/client';

import { env } from '@synopsis/env';

export type Database = PrismaClient;
export * from '@prisma/client';

const globalForPrisma = globalThis as { prisma?: PrismaClient };

export const db =
    globalForPrisma.prisma ??
    new PrismaClient({
        log: process.env['NODE_ENV'] === 'development' ? ['query', 'error', 'warn'] : ['error'],
        datasources: {
            db: {
                url: `postgresql://${env.DB_USERNAME}:${env.DB_PASSWORD}@${env.DB_HOST}/${env.DB_NAME}`,
            },
        },
    });

if (process.env['NODE_ENV'] !== 'production') globalForPrisma.prisma = db;
