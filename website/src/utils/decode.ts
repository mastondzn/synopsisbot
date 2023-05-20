import { decodeJwt } from 'jose';
import { z } from 'zod';

export const JWT_COOKIE_KEY = 'token';

export const jwtShape = z.object({
    twitchId: z.string(),
    twitchLogin: z.string(),
});

export const decodeToken = (jwt: string): JwtShape | null => {
    try {
        const decoded = jwtShape.parse(decodeJwt(jwt));
        return decoded;
    } catch {
        return null;
    }
};

export type JwtShape = z.infer<typeof jwtShape>;
