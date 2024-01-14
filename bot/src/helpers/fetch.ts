import type { z } from 'zod';

type BaseOptions = Omit<RequestInit, 'body'> & {
    url: string | URL;
    body?: unknown;
    throwHttpErrors?: boolean;
};

export async function jfetch<TJson extends boolean = true>(
    {
        url,
        json,
        throwHttpErrors,
        body,
        ...rest
    }: BaseOptions & { json?: TJson; },
): Promise<{
    response: Response;
    body: TJson extends true ? unknown : string;
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

export async function zfetch<TSchema extends z.AnyZodObject>(
    options: BaseOptions & { schema: TSchema; },
): Promise<{
    response: Response;
    body: z.infer<TSchema>;
}> {
    const { response, body } = await jfetch(options);

    return {
        response,
        body: options.schema.parse(body),
    };
}
