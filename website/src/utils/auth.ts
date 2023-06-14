import { randomBytes } from 'node:crypto';

import { db } from '@synopsis/db/next';

export const createState = async () => {
    const state = randomBytes(16).toString('hex');
    await db.authState.create({ data: { state } });
    return state;
};

export const consumeState = async (state: string): Promise<{ ok: boolean }> => {
    const result = await db.authState.delete({ where: { state } }).catch(() => undefined);
    if (result) return { ok: false };
    return { ok: true };
};
