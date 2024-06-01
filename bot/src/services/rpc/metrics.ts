import { Hono } from 'hono';

import { prometheus } from '~/providers/prometheus';

export const route = new Hono().get('/', async ({ text }) => {
    const metrics = await prometheus.metrics();

    return text(metrics, {
        status: 200,
        headers: { 'content-type': prometheus.contentType },
    });
});
