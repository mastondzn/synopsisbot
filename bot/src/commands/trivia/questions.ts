import { z } from 'zod';

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
    category: z.string().transform((str) => decodeURIComponent(str)),
    type: z.literal('multiple'),
    difficulty: z.enum(['easy', 'medium', 'hard']),
    question: z.string().transform((str) => decodeURIComponent(str)),
    correct_answer: z.string().transform((str) => decodeURIComponent(str)),
    incorrect_answers: z
        .array(z.string())
        .transform((arr) => arr.map((str) => decodeURIComponent(str))),
});

const responseSchema = z.object({
    response_code: z.literal(0),
    results: z.tuple([questionSchema]),
});

export type Trivia = z.infer<typeof questionSchema>;

export async function getTrivia(): Promise<Trivia> {
    const response = await fetch(
        'https://opentdb.com/api.php?amount=1&type=multiple&encode=url3986'
    );
    const result = responseSchema.parse(await response.json());
    return result.results[0];
}
