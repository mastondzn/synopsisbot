import { jwtVerify, SignJWT } from 'jose';
import { type NextRequest, type NextResponse } from 'next/server';

import { env } from '@synopsis/env/next';

import { JWT_COOKIE_KEY, type JwtShape, jwtShape } from './decode';

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

export type VerifyJWTResult =
    | {
          ok: true;
          jwt: JwtShape;
      }
    | {
          ok: false;
          error: string;
      };

export const verifyJWT = async (jwt: string | null | undefined): Promise<VerifyJWTResult> => {
    try {
        if (!jwt) return { ok: false, error: 'No JWT' };

        const secret = getEncodedAppSecret();
        const decoded = await jwtVerify(jwt, secret, { algorithms: ['HS256'] }) //
            .catch((error) => ({
                error: error instanceof Error ? error.message : 'Unknown Error',
            }));

        if ('error' in decoded) return { ok: false, error: decoded.error };

        const parsed = jwtShape.parse(decoded.payload);

        return { ok: true, jwt: parsed };
    } catch (error) {
        console.error(error);
        return { ok: false, error: 'Invalid JWT' };
    }
};

export const verifyRequest = async (req: NextRequest): Promise<VerifyJWTResult> => {
    return verifyJWT(req.cookies.get(JWT_COOKIE_KEY)?.value);
};
