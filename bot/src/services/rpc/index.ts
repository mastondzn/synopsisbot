import { serve } from '@hono/node-server';
import { Hono } from 'hono';

import { route as commands } from './commands';
import { route as metrics } from './metrics';
import { prefixes } from '~/helpers/log-prefixes';

export const rpc = new Hono() //
    .route('/metrics', metrics)
    .route('/commands', commands);

export type RPC = typeof rpc;

serve({
    fetch: rpc.fetch,
    port: 3002,
});
console.log(prefixes.rpc, 'rpc server listening on port 3002');
