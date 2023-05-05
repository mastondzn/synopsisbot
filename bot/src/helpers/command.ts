import { type PrivmsgMessage } from '@kararty/dank-twitch-irc';

export const parseCommandParams = (message: string | PrivmsgMessage) => {
    const text = typeof message === 'string' ? message : message.messageText;

    const [prefix, command, ...list] = text.split(' ');
    if (!prefix || !command) throw new Error('Failed to parse command');
    return { prefix, command, list, text: text.replace(`${prefix} ${command}`, '').trim() || null };
};
