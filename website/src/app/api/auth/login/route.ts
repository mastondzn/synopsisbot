import { env } from '@synopsis/env/next';

import { createState } from '~/utils/auth';
import { redirect } from '~/utils/responses';
import { localUrl } from '~/utils/url';

export const dynamic = 'force-dynamic';

export async function GET() {
    const url = new URL('https://id.twitch.tv/oauth2/authorize');

    const state = await createState();

    url.searchParams.set('client_id', env.TWITCH_CLIENT_ID);
    url.searchParams.set('redirect_uri', `${localUrl}/api/auth/acknowledge`);
    url.searchParams.set('response_type', 'code');
    url.searchParams.set('scope', '');
    url.searchParams.set('state', state);

    return redirect(url);
}
