import { env } from '@synopsis/env/next';
import type { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { getRedis } from '~/utils/redis';
import { json } from '~/utils/responses';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest): Promise<NextResponse> {
    const authorization = request.headers.get('authorization');
    if (authorization !== `Bearer ${env.APP_SECRET}`) {
        return json({ ok: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = (await request.json()) as unknown;
    const bodySchema = z.object({
        announce_for: z.number(),
    });

    const parsedBody = bodySchema.safeParse(body);
    if (!parsedBody.success) {
        return json({ ok: false, error: 'Unexpected shape' }, { status: 400 });
    }

    const redis = getRedis();

    await redis.set('dev-announce', 'true', 'EX', parsedBody.data.announce_for);

    return json({ ok: true }, { status: 200 });
}
