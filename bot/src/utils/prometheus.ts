import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { Registry, collectDefaultMetrics } from 'prom-client';

export class PrometheusExposer {
    registry = new Registry();
    private app = new Hono();

    constructor() {
        collectDefaultMetrics({ register: this.registry });

        this.app.get('/metrics', async ({ text }) => {
            const metrics = await this.registry.metrics();

            return text(metrics, {
                status: 200,
                headers: { 'content-type': this.registry.contentType },
            });
        });

        serve({ fetch: this.app.fetch, port: 3003 });
        console.log('[utils:prometheus] prometheus metrics server started on port 3003');
    }
}
