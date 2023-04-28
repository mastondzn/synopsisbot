import type { NextApiRequest, NextApiResponse } from 'next';

import { env } from '~/env.mjs';
import { createState } from '~/utils/auth';
import { getUrl } from '~/utils/url';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({
            error: 'Method Not Allowed',
        });
    }

    const url = new URL('https://id.twitch.tv/oauth2/authorize');

    const state = await createState();

    url.searchParams.set('client_id', env.TWITCH_CLIENT_ID);
    // TODO: dynamically check url
    url.searchParams.set('redirect_uri', `${getUrl()}/api/auth/acknowledge`);
    url.searchParams.set('response_type', 'code');
    url.searchParams.set('scope', '');
    url.searchParams.set('force_verify', 'true');
    url.searchParams.set('state', state);

    return res.redirect(url.href);
}
