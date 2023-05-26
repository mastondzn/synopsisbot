import { getTrivia, type Trivia } from './questions';
import { shuffle } from '~/helpers/functions';
import { collectMessages } from '~/helpers/message-collector';
import { type BotCommand, type CommandFragment } from '~/types/client';

const activeChannels = new Set<string>();

export const command: BotCommand = {
    name: 'trivia',
    description: 'Starts a multiple choice trivia session in chat.',

    async *run({ msg, chat }): AsyncGenerator<CommandFragment> {
        if (activeChannels.has(msg.channelName)) {
            return yield { reply: 'There is already a trivia session active in this channel.' };
        }
        activeChannels.add(msg.channelName);
        setTimeout(() => activeChannels.delete(msg.channelName), 1000 * 32);

        let trivia: Trivia;
        try {
            trivia = await getTrivia();
        } catch {
            activeChannels.delete(msg.channelName);
            return yield { reply: 'Failed to fetch a question.. :/' };
        }

        const correctAnswer = trivia.correct_answer;
        const answers = shuffle([trivia.correct_answer, ...trivia.incorrect_answers]);
        const alphabet = [...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'];

        const correctIndex = answers.indexOf(correctAnswer);
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const correctLetter = alphabet[correctIndex]!.toLowerCase();

        const answersAsString = answers
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            .map((answer, i) => `${alphabet[i]!}. ${decodeURIComponent(answer)}`)
            .join(', ')
            .replace(/, ([^,]*)$/, ', or $1');

        yield {
            say: `New Trivia! [${trivia.category}] ${trivia.question} Is it ${answersAsString}? 30 seconds to answer!`,
        };

        const exhaustedAnswers = new Set<string>();

        const messages = await collectMessages({
            chat,
            timeout: 30,
            filter: (m) => {
                const incoming = m.messageText.toLowerCase().trim();

                const isValidAnswer = answers
                    .map((answer) => answer.toLowerCase())
                    .includes(incoming);
                const isValidLetter = alphabet
                    .map((letter) => letter.toLowerCase())
                    .includes(incoming);

                const accept = isValidAnswer || isValidLetter;

                if (accept && isValidAnswer) {
                    const letterIndex = answers
                        .map((answer) => answer.toLowerCase())
                        .indexOf(incoming);

                    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                    const letter = alphabet[letterIndex]!;
                    exhaustedAnswers.add(letter);
                } else if (accept && isValidLetter) {
                    exhaustedAnswers.add(incoming);
                }

                return accept;
            },
            exitOn: (m) => {
                const incoming = m.messageText.toLowerCase().trim();
                const isCorrectLetter = incoming === correctLetter;
                const isCorrectAnswer = incoming === correctAnswer.toLowerCase();
                const areAnswersExhausted = exhaustedAnswers.size === 3;
                return isCorrectLetter || isCorrectAnswer || areAnswersExhausted;
            },
        });

        const winner = messages.find((m) => {
            const incoming = m.messageText.toLowerCase().trim();
            const isCorrectLetter = incoming === correctLetter;
            const isCorrectAnswer = incoming === correctAnswer.toLowerCase();
            return isCorrectLetter || isCorrectAnswer;
        });

        if (!winner) {
            activeChannels.delete(msg.channelName);
            return yield {
                say: `Nobody got the answer right! PoroSad The answer was ${correctAnswer}.`,
            };
        }

        activeChannels.delete(msg.channelName);
        return yield {
            say: `Congratulations ${winner.displayName}! You got it right! The answer was ${correctAnswer}.`,
        };
    },
};
