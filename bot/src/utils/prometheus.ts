import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { collectDefaultMetrics, Registry } from 'prom-client';

const logPrefix = '[utils:prometheus]';

export class PrometheusExposer {
    registry: Registry;
    app: Hono;

    constructor() {
        this.registry = new Registry();
        collectDefaultMetrics({ register: this.registry });

        this.app = new Hono();
        this.app.get('/metrics', async ({ text }) => {
            return text(await this.registry.metrics(), {
                status: 200,
                headers: { 'Content-Type': this.registry.contentType },
            });
        });

        serve({ fetch: this.app.fetch, port: 3003 });
        console.log(logPrefix, 'prometheus metrics server started on port 3003');
    }
}
