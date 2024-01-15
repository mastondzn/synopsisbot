import { Registry, collectDefaultMetrics } from 'prom-client';

export const prometheus = new Registry();
collectDefaultMetrics({ register: prometheus });
