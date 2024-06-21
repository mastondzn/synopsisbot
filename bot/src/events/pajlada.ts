import { createEventHandler } from '~/helpers/event';
import { chat } from '~/services/chat';

export default createEventHandler({
    event: 'PRIVMSG',
    handler: async (message) => {
        if (
            message.messageText === 'pajaS 🚨 ALERT' &&
            message.channelName === 'pajlada' &&
            message.senderUsername === 'pajbot'
        ) {
            await chat.say(message.channelName, '🚨 pajaConcern ALERTĂ');
        }
    },
});
