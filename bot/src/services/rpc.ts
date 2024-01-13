import { serve } from '@hono/node-server';
import { Hono } from 'hono';

export const rpc = new Hono();

serve({
    fetch: rpc.fetch,
    port: 3002,
});
