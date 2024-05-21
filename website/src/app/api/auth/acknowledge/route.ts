import { type NewAuthedUser, authedUsers } from '@synopsis/db';
import { env } from '@synopsis/env/next';
import { getTokenInfo } from '@twurple/auth';
import type { NextRequest } from 'next/server';
import { z } from 'zod';

import { db } from '~/services/db';
import { consumeState } from '~/utils/auth';
import { setJWTCookie } from '~/utils/jwt/encode';
import { json, redirect } from '~/utils/responses';
import { localUrl } from '~/utils/url';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    const url = new URL(request.url);

    const code = url.searchParams.get('code');
    const scopesFromRedirect = url.searchParams.get('scope')?.split('+');
    const state = url.searchParams.get('state');

    const error = url.searchParams.get('error');
    const errorDescription = url.searchParams.get('error_description');

    if (error && errorDescription && state) {
        await consumeState(state);
        return json({ error: `Bad Request, ${error}: ${errorDescription}` }, { status: 400 });
    }

    if (!code || !Array.isArray(scopesFromRedirect) || !state) {
        return json({ error: 'Bad Request, missing code/scopes/state' }, { status: 400 });
    }

    const stateConsumed = await consumeState(state);
    if (!stateConsumed.ok) {
        return json({ error: 'Bad Request, state could not be consumed.' }, { status: 400 });
    }

    const body = [
        `client_id=${env.TWITCH_CLIENT_ID}`,
        `client_secret=${env.TWITCH_CLIENT_SECRET}`,
        `code=${code}`,
        'grant_type=authorization_code',
        `redirect_uri=${localUrl}/api/auth/acknowledge`,
    ].join('&');

    const response = await fetch('https://id.twitch.tv/oauth2/token', {
        body,
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });

    if (!response.ok) {
        const errorSchema = z.object({
            error: z.string(),
        });

        const errorParseResult = errorSchema.safeParse(await response.json());
        const error = errorParseResult.success ? errorParseResult.data.error : 'Unknown Error';

        return json({
            error: `Bad Request, could not get access token from Twitch (${error})`,
            status: response.status,
        });
    }

    const responseSchema = z.object({
        access_token: z.string(),
        expires_in: z.number(),
        refresh_token: z.string(),
        scope: z.array(z.string()).optional(),
        token_type: z.literal('bearer'),
    });

    const responseBody = (await response.json()) as unknown;

    const responseParseResult = responseSchema.safeParse(responseBody);
    if (!responseParseResult.success) {
        return json(
            { error: 'Internal Server Error, could not parse response from Twitch' },
            { status: 500 },
        );
    }

    const {
        access_token: accessToken,
        refresh_token: refreshToken,
        scope: scopesFromTwitch,
    } = responseParseResult.data;

    const tokenInfo = await getTokenInfo(accessToken, env.TWITCH_CLIENT_ID).catch(
        (error: unknown) =>
            error instanceof Error ? { error: error.message } : { error: 'Unknown Error' },
    );

    if ('error' in tokenInfo) {
        return json(
            { error: `Internal Server Error, could not get token info (${tokenInfo.error})` },
            { status: 500 },
        );
    }

    if (!tokenInfo.userId || !tokenInfo.userName || !tokenInfo.expiryDate) {
        return json(
            { error: 'Internal Server Error, no user id, username, or expiryDate from token info' },
            { status: 500 },
        );
    }

    const user: NewAuthedUser = {
        twitchId: tokenInfo.userId,
        twitchLogin: tokenInfo.userName,
        accessToken,
        refreshToken,
        scopes: scopesFromTwitch ?? scopesFromRedirect,
        expiresAt: tokenInfo.expiryDate,
        obtainedAt: new Date(),
    };

    await db
        .insert(authedUsers)
        .values(user)
        .onConflictDoUpdate({ target: authedUsers.twitchId, set: user });

    return await setJWTCookie(redirect(localUrl), {
        twitchId: tokenInfo.userId,
        twitchLogin: tokenInfo.userName,
    });
}
