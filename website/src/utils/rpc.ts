import type { RPC } from '@synopsis/bot/rpc';
import { hc } from 'hono/client';
import isDocker from 'is-docker';

const host = isDocker() ? 'http://bot' : 'http://localhost:3002';

export const rpcClient = hc<RPC>(host);
