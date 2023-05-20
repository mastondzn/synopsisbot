import { createRouter } from './init';
import { ping } from './routers/ping';

export const appRouter = createRouter({
    ping,
});

// export type definition of API
export type AppRouter = typeof appRouter;
