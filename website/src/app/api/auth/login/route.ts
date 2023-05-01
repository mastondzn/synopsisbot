import { NextResponse } from 'next/server';

import { env } from '~/env.mjs';
import { createState } from '~/utils/auth';
import { getUrl } from '~/utils/url';

// eslint-disable-next-line @typescript-eslint/unbound-method
const { redirect } = NextResponse;

export const GET = async () => {
    const url = new URL('https://id.twitch.tv/oauth2/authorize');

    const state = await createState();

    url.searchParams.set('client_id', env.TWITCH_CLIENT_ID);
    url.searchParams.set('force_verify', 'true');
    url.searchParams.set('redirect_uri', `${getUrl()}/api/auth/acknowledge`);
    url.searchParams.set('response_type', 'code');
    url.searchParams.set('scope', '');
    url.searchParams.set('state', state);

    return redirect(url);
};
