import { SignJWT } from 'jose';
import { type NextResponse } from 'next/server';

import { env } from '@synopsis/env';

import { JWT_COOKIE_KEY, type JwtShape } from './decode';

export const getEncodedAppSecret = () => new TextEncoder().encode(env.APP_SECRET);

const createJWT = async (shape: JwtShape) => {
    const secret = getEncodedAppSecret();
    const jwt = await new SignJWT(shape)
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .sign(secret);

    return jwt;
};

export const setJWTCookie = async (
    res: NextResponse, //
    shape: JwtShape
): Promise<NextResponse> => {
    const jwt = await createJWT(shape);

    res.cookies.set(JWT_COOKIE_KEY, jwt);
    return res;
};
