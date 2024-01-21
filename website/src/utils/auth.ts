import { randomBytes } from 'node:crypto';

import { eq, states } from '@synopsis/db';

import { db } from '~/services/db';

export async function createState() {
    const state = randomBytes(16).toString('hex');
    await db.insert(states).values({ state });
    return state;
}

export async function consumeState(state: string): Promise<{ ok: boolean }> {
    const result = await db.delete(states).where(eq(states.state, state)).returning();
    if (result.length === 0) {
        return { ok: false };
    }
    return { ok: true };
}
