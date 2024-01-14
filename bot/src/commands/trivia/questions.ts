import { z } from 'zod';

import { zfetch } from '~/helpers/fetch';

// const result = {
//     response_code: 0,
//     results: [
//         {
//             category: 'Entertainment: Video Games',
//             type: 'boolean',
//             difficulty: 'easy',
//             question: 'Doki Doki Literature Club was developed in Japan.',
//             correct_answer: 'False',
//             incorrect_answers: ['True'],
//         },
//     ],
// };
// https://opentdb.com/api.php?amount=1&type=multiple

const questionSchema = z.object({
    category: z.string().transform(string_ => decodeURIComponent(string_)),
    type: z.literal('multiple'),
    difficulty: z.enum(['easy', 'medium', 'hard']),
    question: z.string().transform(string_ => decodeURIComponent(string_)),
    correct_answer: z.string().transform(string_ => decodeURIComponent(string_)),
    incorrect_answers: z
        .array(z.string())
        .transform(array => array.map(string_ => decodeURIComponent(string_))),
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
