import { env } from '@synopsis/env/next';
import { SignJWT } from 'jose';
import type { NextResponse } from 'next/server';

import { JWT_COOKIE_KEY, type JwtShape } from './decode';

export const getEncodedAppSecret = () => new TextEncoder().encode(env.APP_SECRET);

async function createJWT(shape: JwtShape) {
    const secret = getEncodedAppSecret();
    const jwt = await new SignJWT(shape)
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .sign(secret);

    return jwt;
}

export async function setJWTCookie(response: NextResponse, shape: JwtShape): Promise<NextResponse> {
    const jwt = await createJWT(shape);

    response.cookies.set(JWT_COOKIE_KEY, jwt);
    return response;
}
