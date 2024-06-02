import { serve } from '@hono/node-server';
import { env } from '@synopsis/env/node';
import { Hono } from 'hono';

import { route as commands } from './commands';
import { route as metrics } from './metrics';
import { prefixes } from '~/helpers/log-prefixes';

export const rpcServer = new Hono() //
    .route('/metrics', metrics)
    .route('/commands', commands);

export type RPC = typeof rpcServer;

if (env.NODE_ENV !== 'test') {
    serve({
        fetch: rpcServer.fetch,
        port: 3002,
    });
    console.log(prefixes.rpc, 'rpc server listening on port 3002');
}
