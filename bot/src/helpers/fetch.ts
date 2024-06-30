import type { z } from 'zod';

export type ZFetchOptions<TSchema extends z.ZodTypeAny> = RequestInit & {
    url: string | URL;
    throwHttpErrors?: boolean;
    schema?: TSchema;
    json?: unknown;
};

export type TypedResponse<T = unknown> = Response & {
    json: () => Promise<T>;
};

export class HTTPError extends Error {
    response: Response;
    constructor(response: Response) {
        super(`HTTP Error ${response.status}: ${response.statusText}`);
        this.response = response;
    }
}

export function zfetch<TSchema extends z.ZodType<unknown> = z.ZodType<unknown>>({
    schema,
    url,
    throwHttpErrors,
    json,
    ...rest
}: ZFetchOptions<TSchema>): Promise<TypedResponse<z.infer<TSchema>>> & {
    json: () => Promise<z.infer<TSchema>>;
    text: () => Promise<string>;
    arrayBuffer: () => Promise<ArrayBuffer>;
    blob: () => Promise<Blob>;
} {
    if (json) {
        if (rest.body) throw new TypeError('Cannot specify both json and body options');
        if (typeof json !== 'object') throw new TypeError('"json" option must be an object');
        rest.body = JSON.stringify(json);
    }

    const promise = fetch(url, rest).then((response) => {
        if (throwHttpErrors && !response.ok) throw new HTTPError(response);
        const parse = response.json.bind(response);
        return Object.assign(response, {
            json: async () => (schema ? await schema.parseAsync(await parse()) : await parse()),
        });
    });

    return Object.assign(promise, {
        json: async () => await (await promise).json(),
        text: async () => await (await promise).text(),
        blob: async () => await (await promise).blob(),
        arrayBuffer: async () => await (await promise).arrayBuffer(),
    });
}
