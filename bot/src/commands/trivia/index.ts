import { type Trivia, getTrivia } from './questions';
import { shuffle } from '~/helpers/array';
import type { CommandFragment } from '~/helpers/command';
import { defineCommand } from '~/helpers/command';
import { chat } from '~/services';

const activeChannels = new Set<string>();

export default defineCommand({
    name: 'trivia',
    description: 'Starts a multiple choice trivia session in chat.',

    async *run({ message }): AsyncGenerator<CommandFragment> {
        if (activeChannels.has(message.channelName)) {
            return yield { reply: 'There is already a trivia session active in this channel.' };
        }
        activeChannels.add(message.channelName);
        setTimeout(() => activeChannels.delete(message.channelName), 1000 * 32);

        let trivia: Trivia;
        try {
            trivia = await getTrivia();
        } catch (error) {
            console.error(error);
            activeChannels.delete(message.channelName);
            return yield { reply: 'Failed to fetch a question.. :/' };
        }

        const correctAnswer = trivia.correct_answer;
        const answers = shuffle([trivia.correct_answer, ...trivia.incorrect_answers]);
        const alphabet = [...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'];

        const correctIndex = answers.indexOf(correctAnswer);
        const correctLetter = alphabet[correctIndex]!.toLowerCase();

        const answersAsString = answers
            .map((answer, index) => `${alphabet[index]!}. ${answer}`)
            .join(', ')
            .replace(/, ([^,]*)$/, ', or $1');

        yield {
            reply: `New Trivia! [${trivia.category}] ${trivia.question} Is it ${answersAsString}? 30 seconds to answer!`,
        };

        const exhaustedAnswers = new Set<string>();

        const messages = await chat.collectMessages({
            timeout: 30,
            filter: (incoming) => {
                if (incoming.channelName !== message.channelName) return false;

                const incomingContent = incoming.messageText.toLowerCase().trim();

                const isValidAnswer = answers
                    .map(answer => answer.toLowerCase())
                    .includes(incomingContent);
                const isValidLetter = alphabet
                    .map(letter => letter.toLowerCase())
                    .includes(incomingContent);

                if (isValidAnswer) {
                    const letterIndex = answers
                        .map(answer => answer.toLowerCase())
                        .indexOf(incomingContent);
                    const letter = alphabet[letterIndex]!;
                    exhaustedAnswers.add(letter);
                } else if (isValidLetter) {
                    exhaustedAnswers.add(incomingContent);
                }

                return isValidAnswer || isValidLetter;
            },
            exitOn: (incoming) => {
                const incomingContent = incoming.messageText.toLowerCase().trim();
                const isCorrectLetter = incomingContent === correctLetter;
                const isCorrectAnswer = incomingContent === correctAnswer.toLowerCase();
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

        activeChannels.delete(message.channelName);

        if (!winner) {
            return yield {
                say: `Nobody got the answer right! PoroSad The answer was ${correctAnswer}.`,
            };
        }

        return yield {
            reply: [
                `Congratulations ${winner.displayName}!`,
                `You got it right! The answer was ${correctLetter.toUpperCase()}. ${correctAnswer}.`,
            ].join(' '),
            to: winner,
        };
    },
});
