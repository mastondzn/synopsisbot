import type { z } from 'zod';

type ZFetchOptions<TSchema extends z.ZodTypeAny> = RequestInit & {
    url: string | URL;
    body?: unknown;
    throwHttpErrors?: boolean;
    schema?: TSchema;
};

export type TypedResponse<T> = Response & {
    json: () => Promise<T>;
};

export class HTTPError extends Error {
    response: Response;
    constructor(response: Response) {
        super(`HTTP Error ${response.status}: ${response.statusText}`);
        this.response = response;
    }
}

export function zfetch<TSchema extends z.ZodType<unknown> = z.ZodType<unknown>>(
    options: ZFetchOptions<TSchema>,
): Promise<TypedResponse<z.infer<TSchema>>> & {
    json: () => Promise<z.infer<TSchema>>;
    text: () => Promise<string>;
} {
    const { schema, url, body, throwHttpErrors, ...rest } = options;

    const promise = fetch(url, {
        ...rest,
        body: typeof body === 'string' ? body : JSON.stringify(body),
    }).then((response) => {
        if (throwHttpErrors && !response.ok) throw new HTTPError(response);
        const parse = response.json.bind(response);
        return Object.assign(response, {
            json: async () => (schema ? await schema.parseAsync(await parse()) : await parse()),
        });
    });

    return Object.assign(promise, {
        json: async () => await (await promise).json(),
        text: async () => await (await promise).text(),
    });
}
