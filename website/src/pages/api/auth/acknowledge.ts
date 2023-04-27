import { getTokenInfo } from '@twurple/auth';
import { z } from 'zod';
import type { NextApiRequest, NextApiResponse } from 'next';

import { authedUsers, type NewAuthedUser } from '@synopsis/db';

import { env } from '~/env.mjs';
import { consumeState } from '~/utils/auth';
import { db } from '~/utils/db';
import { getUrl } from '~/utils/url';

// const supportedClaims: string[] = [];
// const signingAlgorithms: string[] = [];

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({
            error: 'Method Not Allowed',
        });
    }

    if (!req.url) {
        return res.status(400).json({
            error: 'Bad Request',
        });
    }

    const url = new URL(req.url, getUrl());

    const code = url.searchParams.get('code');
    const scopesFromRedirect = url.searchParams.get('scope')?.split('+');
    const state = url.searchParams.get('state');

    const error = url.searchParams.get('error');
    const errorDescription = url.searchParams.get('error_description');

    if (error && errorDescription && state) {
        await consumeState(state);
        return res.status(400).json({
            error: `Bad Request, ${error}: ${errorDescription}`,
        });
    }

    if (!code || !Array.isArray(scopesFromRedirect) || !state) {
        return res.status(400).json({
            error: 'Bad Request, missing code/scopes/state',
        });
    }

    const stateConsumed = await consumeState(state);
    if (!stateConsumed.ok) {
        return res.status(400).json({
            error: 'Bad Request, state could not be consumed.',
        });
    }

    const body = [
        `client_id=${env.TWITCH_CLIENT_ID}`,
        `client_secret=${env.TWITCH_CLIENT_SECRET}`,
        `code=${code}`,
        'grant_type=authorization_code',
        `redirect_uri=${getUrl()}/api/auth/acknowledge`,
    ].join('&');

    const response = await fetch('https://id.twitch.tv/oauth2/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body,
    });

    if (!response.ok) {
        const errorSchema = z.object({
            error: z.string(),
        });

        const errorParseResult = errorSchema.safeParse(await response.json());
        const error = errorParseResult.success ? errorParseResult.data.error : 'Unknown Error';

        return res.status(response.status).json({
            error: `Bad Request, could not get access token from Twitch (${error})`,
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
        return res.status(500).json({
            error: 'Internal Server Error, could not parse response from Twitch',
        });
    }

    const {
        access_token: accessToken,
        refresh_token: refreshToken,
        scope: scopesFromTwitch,
    } = responseParseResult.data;

    const tokenInfo = await getTokenInfo(accessToken, env.TWITCH_CLIENT_ID).catch((error) =>
        error instanceof Error ? { error: error.message } : { error: 'Unknown Error' }
    );

    if ('error' in tokenInfo) {
        return res.status(500).json({
            error: `Internal Server Error, could not get token info from Twitch (${tokenInfo.error})`,
        });
    }

    if (!tokenInfo.userId || !tokenInfo.userName || !tokenInfo.expiryDate) {
        return res.status(500).json({
            error: 'Internal Server Error, could not get user id, username, or expiryDate from token info',
        });
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

    return res.status(200).json({
        ok: true,
    });
}
