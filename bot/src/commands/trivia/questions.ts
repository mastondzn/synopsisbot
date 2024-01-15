import { z } from 'zod';

import { zfetch } from '~/helpers/fetch';

const questionSchema = z.object({
    category: z.string().transform(string => decodeURIComponent(string)),
    type: z.literal('multiple'),
    difficulty: z.enum(['easy', 'medium', 'hard']),
    question: z.string().transform(string => decodeURIComponent(string)),
    correct_answer: z.string().transform(string => decodeURIComponent(string)),
    incorrect_answers: z
        .array(z.string())
        .transform(array => array.map(string => decodeURIComponent(string))),
});

const responseSchema = z.object({
    response_code: z.literal(0),
    results: z.tuple([questionSchema]),
});

export type Trivia = z.infer<typeof questionSchema>;

export async function getTrivia(): Promise<Trivia> {
    const { body } = await zfetch({
        url: 'https://opentdb.com/api.php?amount=1&type=multiple&encode=url3986',
        schema: responseSchema,
    });

    return body.results[0];
}
