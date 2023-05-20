import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import { type NextRequest } from 'next/server';

import { appRouter } from '~/server/trpc';

const handler = (req: NextRequest) => {
    return fetchRequestHandler({
        req,
        endpoint: '/api/trpc',
        router: appRouter,
        createContext: () => ({ req }),
    });
};

export { handler as GET, handler as POST };
