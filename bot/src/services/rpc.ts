import { serve } from '@hono/node-server';
import { env } from '@synopsis/env/node';
import { Hono } from 'hono';

import { prometheus } from './prometheus';

export const rpc = new Hono();

export const route = rpc.get('/metrics', async ({ text }) => {
    const metrics = await prometheus.metrics();

    return text(metrics, {
        status: 200,
        headers: { 'content-type': prometheus.contentType },
    });
});

if (env.NODE_ENV !== 'test') {
    serve({
        fetch: rpc.fetch,
        port: 3002,
    });
    console.log('RPC server listening on port 3002');
}
