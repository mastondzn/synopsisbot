import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import type { NextRequest } from 'next/server';

import { appRouter } from '~/server/trpc';

function handler(request: NextRequest) {
    return fetchRequestHandler({
        req: request,
        endpoint: '/api/trpc',
        router: appRouter,
        createContext: () => ({ req: request }),
    });
}

export { handler as GET, handler as POST };
