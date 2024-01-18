import { serve } from '@hono/node-server';
import { env } from '@synopsis/env/node';
import { Hono } from 'hono';

import { prometheus } from '../providers/prometheus';
import { prefixes } from '~/helpers/log-prefixes';

export const rpc = new Hono()
    .get('/metrics', async ({ text }) => {
        const metrics = await prometheus.metrics();

        return text(metrics, {
            status: 200,
            headers: { 'content-type': prometheus.contentType },
        });
    });

export type RPC = typeof rpc;

if (env.NODE_ENV !== 'test') {
    serve({
        fetch: rpc.fetch,
        port: 3002,
    });
    console.log(prefixes.rpc, 'rpc server listening on port 3002');
}
