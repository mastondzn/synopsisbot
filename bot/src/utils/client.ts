import { ChatClient } from '@kararty/dank-twitch-irc';

import { retry } from '~/helpers/retry';

const log = (err: Error, attempt: number) => {
    console.error(`[retry] say attempt ${attempt}`);
    console.error(err);
};

export class BotChatClient extends ChatClient {
    override async say(channelName: string, message: string): Promise<void> {
        return await retry(() => super.say(channelName, message), {
            retries: 3,
            delay: 350,
            onRetry: log,
        });
    }

    override async reply(channelName: string, messageID: string, message: string): Promise<void> {
        return await retry(() => super.reply(channelName, messageID, message), {
            retries: 3,
            delay: 350,
            onRetry: log,
        });
    }
}
