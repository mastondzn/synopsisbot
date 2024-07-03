import { create } from '~/helpers/creators';
import { chat } from '~/services/chat';

export default create.listener({
    event: 'PRIVMSG',
    listener: async (message) => {
        if (
            message.messageText === 'pajaS 🚨 ALERT' &&
            message.channelName === 'pajlada' &&
            message.senderUsername === 'pajbot'
        ) {
            await chat.say(message.channelName, '🚨 pajaConcern ALERTĂ');
        }
    },
});
