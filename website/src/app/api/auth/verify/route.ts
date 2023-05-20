import { type NextRequest } from 'next/server';

import { verifyRequest } from '~/utils/encode';
import { json } from '~/utils/responses';

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
