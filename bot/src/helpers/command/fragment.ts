import type { PrivmsgMessage } from '@mastondzn/dank-twitch-irc';

import type { CommandFragment } from '.';
import { chat } from '~/services';

export function consumeFragment(fragment: CommandFragment, message: PrivmsgMessage): Promise<void> {
    if ('reply' in fragment) {
        return chat.reply(
            fragment.channel ?? message.channelName,
            fragment.to?.messageID ?? message.messageID,
            fragment.reply,
        );
    } else if ('action' in fragment) {
        return chat.me(fragment.channel ?? message.channelName, fragment.action);
    } else if ('say' in fragment) {
        return chat.say(fragment.channel ?? message.channelName, fragment.say);
    }

    throw new Error('invalid fragment');
}
