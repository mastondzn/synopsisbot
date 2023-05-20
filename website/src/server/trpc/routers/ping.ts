import { publicProcedure } from '../init';

export const ping = publicProcedure.query(() => 'pong');
