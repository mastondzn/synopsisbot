import type { NextRequest } from 'next/server';

import { json } from '~/utils/responses';
import { verifyRequest } from '~/utils/verify';

export async function GET(request: NextRequest) {
    const jwt = await verifyRequest(request);

    if (!jwt.ok) {
        return json(
            { ok: false, error: 'Unauthorized' }, //
            { status: 401 },
        );
    }

    return json({ ok: true, jwt });
}
