import { type NextRequest, type NextResponse } from 'next/server';
import { z } from 'zod';

import { env } from '@synopsis/env/next';

import { redis } from '~/utils/redis';
import { json } from '~/utils/responses';

export const dynamic = 'force-dynamic';

export const POST = async (req: NextRequest): Promise<NextResponse> => {
    const authorization = req.headers.get('authorization');
    if (authorization !== `Bearer ${env.APP_SECRET}`) {
        return json({ ok: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = (await req.json()) as unknown;
    const bodySchema = z.object({
        announce_for: z.number(),
    });

    const parsedBody = bodySchema.safeParse(body);
    if (!parsedBody.success) {
        return json({ ok: false, error: 'Unexpected shape' }, { status: 400 });
    }

    await redis.set('dev-announce', 'true', 'EX', parsedBody.data.announce_for);

    return json({ ok: true }, { status: 200 });
};
