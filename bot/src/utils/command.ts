import { type ChatMessage } from '~/types/client';

export const parseCommandParams = (message: string | ChatMessage) => {
    const text = typeof message === 'string' ? message : message.text;

    const [prefix, command, ...list] = text.split(' ');
    if (!prefix || !command) throw new Error('Failed to parse command');
    return { prefix, command, list, text: text.replace(`${prefix} ${command}`, '').trim() || null };
};
