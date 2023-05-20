import { jwtVerify } from 'jose';
import { type NextRequest } from 'next/server';

import { JWT_COOKIE_KEY, type JwtShape, jwtShape } from './decode';
import { getEncodedAppSecret } from './encode';

export const verifyJWT = async (jwt: string): Promise<JwtShape | null> => {
    try {
        const secret = getEncodedAppSecret();
        const decoded = await jwtVerify(
            jwt, //
            secret,
            { algorithms: ['HS256'] }
        );

        return jwtShape.parse(decoded.payload);
    } catch (error) {
        console.error(error);
        return null;
    }
};

export const verifyRequest = async (req: NextRequest): Promise<JwtShape | null> => {
    const jwt = req.cookies.get(JWT_COOKIE_KEY)?.value;
    if (!jwt) return null;

    return verifyJWT(jwt);
};
