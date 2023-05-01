import chalk from 'chalk';

import { getChannelModeByLogin } from '@synopsis/db';
import { env } from '@synopsis/env/node';

import { hasDevProcess } from '~/modules/devcheck';
import { type BotCommandContext, type BotEventHandler } from '~/types/client';
import { parseCommandParams } from '~/utils/command';

const botPrefix = 'sb ';

const logPrefix = chalk.bgBlue('[events:commands]');

export const event: BotEventHandler = {
    event: 'onMessage',
    handler: async (ctx) => {
        const { params, chat, commands, utils, db } = ctx;
        const { cooldownManager, statusManager } = utils;
        const [channel, userName, text, msg] = params;

        if (!text.startsWith(botPrefix)) return;

        const commandIdentifier = text.replace(/ +/g, ' ').split(' ')[1]?.toLowerCase();
        if (!commandIdentifier) return;

        const inDefaultChannel = [env.TWITCH_BOT_OWNER_USERNAME, env.TWITCH_BOT_USERNAME].includes(
            channel.replace(/#+/, '')
        );

        const command = commands.find(
            (c) => c.name === commandIdentifier || c.aliases?.includes(commandIdentifier)
        );

        const conditions = [
            // if we're in development don't reply to commands in non-default channels
            env.NODE_ENV === 'development' && !inDefaultChannel,
            // if we're in production and theres a dev process running don't reply to commands in default channels
            env.NODE_ENV === 'production' && hasDevProcess() && inDefaultChannel,
        ];

        if (conditions.some(Boolean)) return;
        if (!command) return;

        console.log(logPrefix, `executing command ${command.name} from ${userName} in ${channel}`);
        console.log(logPrefix, `${userName}: "${text}"`);

        const [mode, isLive, isOnCooldown] = await Promise.all([
            getChannelModeByLogin(db, channel.replace(/#+/, '')),
            statusManager.isLive(channel),
            cooldownManager.isOnCooldown({ command, channel, userName }),
        ]);

        if (!mode || isOnCooldown) return;
        if (mode === 'readonly') return;
        if (mode === 'offline-only' && isLive) return;

        const shard = chat.getShardByChannel(channel);
        if (!shard) throw new Error(`No shard found for channel ${channel}`);

        const commandContext: BotCommandContext = {
            ...ctx,
            shard,

            reply: (text) =>
                chat.say(channel, `@${msg.userInfo.displayName}, ${text}`, { replyTo: msg }),

            say: (text) => chat.say(channel, text),

            params: parseCommandParams(text),

            msg: Object.assign(msg, {
                channel,
                userName,
                text,
            }),
        };

        try {
            await command.run(commandContext);
            console.log(logPrefix, `command ${command.name} executed successfully`);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'unknown error';
            console.error(
                logPrefix,
                `error executing command ${command.name} from ${userName} in ${channel} ("${text}"): ${errorMessage}`
            );
            console.error(error);

            const errorMessageToChat = `@${msg.userInfo.displayName}, something went wrong :/ (${errorMessage})`;
            await chat.say(channel, errorMessageToChat, { replyTo: msg }).catch((error) => {
                const errorMessage = error instanceof Error ? error.message : 'unknown error';
                console.error(
                    logPrefix,
                    `error sending error message to ${userName} in ${channel}: ${errorMessage}`
                );
            });
        }
    },
};
