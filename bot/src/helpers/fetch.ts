import type { z } from 'zod';

type BaseOptions = Omit<RequestInit, 'body'> & {
    url: string | URL;
    body?: unknown;
    throwHttpErrors?: boolean;
};

export async function jfetch<TJson extends boolean>(
    {
        url,
        json = true,
        throwHttpErrors,
        body,
        ...rest
    }: BaseOptions & { json?: TJson | boolean; },
): Promise<{
    response: Response;
    body: TJson;
}> {
    const response = await fetch(url, {
        ...rest,
        body: typeof body === 'string' ? body : JSON.stringify(body),
    });

    if (throwHttpErrors && !response.ok) {
        throw new Error(`HTTP error ${response.status}: ${response.statusText}`);
    }

    return {
        response,
        // @ts-expect-error its fine
        body: json ? await response.json() : await response.text(),
    };
}

export async function zfetch<TSchema extends z.ZodType>(
    options: BaseOptions & { schema: TSchema; },
): Promise<{
    response: Response;
    body: z.infer<TSchema>;
}> {
    const { response, body } = await jfetch(options);

    return {
        response,
        body: options.schema.parse(body) as z.infer<TSchema>,
    };
}
