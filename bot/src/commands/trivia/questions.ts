import { netter } from 'netter';
import { z } from 'zod';

const decoded = z.string().transform((string) => decodeURIComponent(string));

const questionSchema = z.object({
    category: decoded,
    type: z.literal('multiple'),
    difficulty: z.enum(['easy', 'medium', 'hard']),
    question: decoded,
    correct_answer: decoded,
    incorrect_answers: z.array(decoded),
});

const responseSchema = z.object({
    response_code: z.literal(0),
    results: z.tuple([questionSchema]).rest(z.unknown()),
});

export type Trivia = z.infer<typeof questionSchema>;

export async function getTrivia(): Promise<Trivia> {
    const json = await netter('https://opentdb.com/api.php?amount=1&type=multiple&encode=url3986', {
        parse: (data) => responseSchema.parse(data),
    }).json();

    return json.results[0];
}
