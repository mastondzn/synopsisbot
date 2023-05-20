import { TRPCError } from '@trpc/server';

import { middleware, publicProcedure } from '../init';
import { verifyRequest } from '~/utils/verify';

export const isAuthed = middleware(async ({ ctx: { req }, next }) => {
    const jwt = await verifyRequest(req);

    if (!jwt.ok) {
        throw new TRPCError({
            code: 'UNAUTHORIZED',
            message: 'You are not authorized',
        });
    }

    return next({ ctx: { req, jwt } });
});

export const authedProcedure = publicProcedure.use(isAuthed);
