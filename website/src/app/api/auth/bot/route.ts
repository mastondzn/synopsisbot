import { env } from '@synopsis/env';
import { allScopes } from '@synopsis/scopes';

import { createState } from '~/utils/auth';
import { redirect } from '~/utils/responses';
import { getUrl } from '~/utils/url';

export const dynamic = 'force-dynamic';

export const GET = async () => {
    const url = new URL('https://id.twitch.tv/oauth2/authorize');

    const state = await createState();

    url.searchParams.set('client_id', env.TWITCH_CLIENT_ID);
    url.searchParams.set('redirect_uri', `${getUrl()}/api/auth/acknowledge`);
    url.searchParams.set('response_type', 'code');
    url.searchParams.set('scope', [...new Set(allScopes)].join(' '));
    url.searchParams.set('state', state);

    return redirect(url);
};
