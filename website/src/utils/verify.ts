import { jwtVerify } from 'jose';
import { type NextRequest } from 'next/server';

import { JWT_COOKIE_KEY, type JwtShape, jwtShape } from './decode';
import { getEncodedAppSecret } from './encode';

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
