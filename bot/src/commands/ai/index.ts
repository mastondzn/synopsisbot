import { generateText } from 'ai';
import dedent from 'dedent';

import { openrouter } from './models';
import * as schemas from './schemas';
import { chunkText } from '~/helpers/chunk';
import { create } from '~/helpers/creators';
import { trim } from '~/helpers/tags';

export default create.command({
    name: 'ai',
    description: 'Ask the AI a question!',
    aliases: ['gpt'],

    options: {
        model: {
            aliases: ['m'],
            schema: schemas.model,
        },
        temperature: {
            aliases: ['t', 'temp'],
            schema: schemas.temperature,
        },
        system: { schema: schemas.system },
        debug: { schema: schemas.debug },
    },

    async *run({
        options: { model, temperature, system, debug },
        parameters: { text },
        user,
        channel,
    }): AsyncGenerator<{ reply: string }> {
        if (!text) {
            return yield {
                reply: 'There is no text to generate a response for.',
            };
        }

        const prompt = dedent`
            You are a chat bot in a Twitch chat room, and you are being prompted by a chatter, his name is ${user.login}.
            The live streamer's name is ${channel.login}, they are not currently live though, people are just chatting while he's offline.

            There is no support for formatting, do not use markdown or any other formatting.
            Newlines are also not supported, do not use them.
            Keep your responses shorter, chat supports up to 480 characters per message.
        `;

        const response = await generateText({
            model: openrouter(model),
            messages: [{ role: 'user', content: text }],
            ...(system ? { system: prompt } : {}),
            ...(temperature ? { temperature } : {}),
        });

        let reply = response.text;

        if (debug) {
            reply += ' ';
            reply += trim`
                (model: ${model},
                prompt: ${response.usage.promptTokens} tokens,
                completion: ${response.usage.completionTokens} tokens, 
                finishReason: ${response.finishReason})
            `;
        }

        for (const chunk of chunkText(reply, 450)) {
            yield { reply: chunk };
        }
    },
});
