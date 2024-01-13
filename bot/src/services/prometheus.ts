import { Registry, collectDefaultMetrics } from 'prom-client';

import { rpc } from './rpc';

class Prometheus extends Registry {
    constructor() {
        super();
        collectDefaultMetrics({ register: this });

        rpc.get('/metrics', async ({ text }) => {
            const metrics = await this.metrics();
            return text(metrics, {
                status: 200,
                headers: { 'content-type': this.contentType },
            });
        });
    }
}

export const prometheus = new Prometheus();
