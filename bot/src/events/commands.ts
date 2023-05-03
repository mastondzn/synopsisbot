import chalk from 'chalk';
import { type Redis } from 'ioredis';

import { getChannelModeByLogin } from '@synopsis/db';
import { env } from '@synopsis/env/node';

import { type BotCommandContext, type BotEventHandler } from '~/types/client';
import { parseCommandParams } from '~/utils/command';

const botPrefix = 'sb ';

const logPrefix = chalk.bgBlue('[events:commands]');

const hasDevProcess = async (redis: Redis): Promise<boolean> => {
    const devProcess = await redis.get('dev-announce');
    return devProcess === 'true';
};

export const event: BotEventHandler = {
    event: 'PRIVMSG',
    handler: async (ctx) => {
        const { params, chat, commands, utils, db, cache } = ctx;
        const { cooldownManager, statusManager } = utils;
        const [msg] = params;

        const text = msg.messageText;
        const channel = msg.channelName;

        if (!msg.messageText.startsWith(botPrefix)) return;

        const commandIdentifier = text.replace(/ +/g, ' ').split(' ')[1]?.toLowerCase();
        if (!commandIdentifier) return;

        const inDefaultChannel = //
            [env.TWITCH_BOT_OWNER_USERNAME, env.TWITCH_BOT_USERNAME].includes(channel);

        const command = commands.find(
            (c) => c.name === commandIdentifier || c.aliases?.includes(commandIdentifier)
        );

        const conditions = [
            // if we're in development don't reply to commands in non-default channels
            env.NODE_ENV === 'development' && !inDefaultChannel,
            // if we're in production and theres a dev process running don't reply to commands in default channels
            env.NODE_ENV === 'production' && (await hasDevProcess(cache)) && inDefaultChannel,
        ];

        if (conditions.some(Boolean)) return;
        if (!command) return;

        console.log(
            logPrefix,
            `executing command ${command.name} from ${msg.senderUsername} in ${channel}`
        );
        console.log(logPrefix, `${msg.senderUsername}: "${text}"`);

        const [mode, isLive, isOnCooldown] = await Promise.all([
            getChannelModeByLogin(db, channel),
            statusManager.isLive(channel),
            cooldownManager.isOnCooldown({ command, channel, userName: msg.senderUsername }),
        ]);

        if (!mode || isOnCooldown) return;
        if (mode === 'readonly') return;
        if (mode === 'offline-only' && isLive) return;

        const reply = (text: string) =>
            chat.reply(channel, msg.messageID, `@${msg.displayName}, ${text}`);
        const say = (text: string) => chat.say(channel, text);

        const commandContext: BotCommandContext = {
            ...ctx,
            msg,
            reply,
            say,

            params: parseCommandParams(text),
        };

        try {
            await command.run(commandContext);
            console.log(logPrefix, `command ${command.name} executed successfully`);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'unknown error';
            console.error(
                logPrefix,
                `error executing command ${command.name} from ${msg.senderUsername} in ${channel} ("${text}"): ${errorMessage}`
            );
            console.error(error);

            const errorMessageToChat = `something went wrong :/ (${errorMessage})`;
            await reply(errorMessageToChat).catch((error) => {
                const errorMessage = error instanceof Error ? error.message : 'unknown error';
                console.error(
                    logPrefix,
                    `error sending error message to ${msg.senderUsername} in ${channel}: ${errorMessage}`
                );
            });
        }
    },
};
