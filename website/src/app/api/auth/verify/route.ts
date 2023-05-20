import { type NextRequest } from 'next/server';

import { json } from '~/utils/responses';
import { verifyRequest } from '~/utils/verify';

export const GET = async (req: NextRequest) => {
    const jwt = await verifyRequest(req);

    if (!jwt.ok) {
        return json(
            { ok: false, error: 'Unauthorized' }, //
            { status: 401 }
        );
    }

    return json({ ok: true, jwt });
};
