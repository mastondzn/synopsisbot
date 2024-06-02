import type { RPC } from '@synopsis/bot/rpc';
import { hc } from 'hono/client';
import isDocker from 'is-docker';

const host = isDocker() ? 'http://bot:3002' : 'http://localhost:3002';

export const rpc = hc<RPC>(host);
