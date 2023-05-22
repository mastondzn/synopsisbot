import chalk from 'chalk';
import { type Redis } from 'ioredis';

import { getChannelModeByLogin } from '@synopsis/db';
import { env } from '@synopsis/env/node';

import { getCommandPermissions, parseCommandParams } from '~/helpers/command';
import { type BotCommandContext, type BotEventHandler } from '~/types/client';

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
        const { cooldownManager, statusManager, permissions } = utils;
        const [msg] = params;

        const text = msg.messageText;
        const channel = msg.channelName;

        if (!msg.messageText.startsWith(botPrefix)) return;

        const commandIdentifier = text.replaceAll(/ +/g, ' ').split(' ')[1]?.toLowerCase();
        if (!commandIdentifier) return;

        const inDefaultChannel = //
            [env.TWITCH_BOT_OWNER_USERNAME, env.TWITCH_BOT_USERNAME].includes(channel);

        const command = commands.find(
            (c) => c.name === commandIdentifier || c.aliases?.includes(commandIdentifier)
        );

        // if we're in development don't reply to commands in non-default channels
        if ((env.NODE_ENV === 'development' && !inDefaultChannel) || !command) return;

        const wantedPermissions = getCommandPermissions(command);

        const [mode, isLive, isOnCooldown, devProcessCheck, isPermitted] = await Promise.all([
            getChannelModeByLogin(db, channel),
            statusManager.isLive(channel),
            cooldownManager.isOnCooldown({ command, channel, userName: msg.senderUsername }),

            // if we're in production and theres a dev process running don't reply to commands in default channels
            hasDevProcess(cache).then(
                (hasDevProcess) =>
                    env.NODE_ENV === 'production' && hasDevProcess && inDefaultChannel
            ),

            // scuffed
            wantedPermissions.mode === 'custom'
                ? Promise.resolve(true)
                : wantedPermissions.mode === 'all'
                ? permissions.pleasesGlobalAndLocal(
                      wantedPermissions.global,
                      wantedPermissions.local,
                      msg
                  )
                : permissions.pleasesGlobalOrLocal(
                      wantedPermissions.global,
                      wantedPermissions.local,
                      msg
                  ),
        ]);

        const dontExecute: boolean =
            devProcessCheck ||
            isOnCooldown ||
            !isPermitted ||
            !mode ||
            mode === 'readonly' ||
            (mode === 'offlineonly' && isLive);

        const cancel = () =>
            cooldownManager.clearCooldown({ command, channel, userName: msg.senderUsername });

        if (!mode) console.warn(logPrefix, `mode for channel ${channel} not found in database`);
        if (dontExecute) {
            await cancel();
            return;
        }

        console.log(
            logPrefix,
            `executing command ${command.name} from ${msg.senderUsername} in ${channel}`
        );
        console.log(logPrefix, `${msg.senderUsername}: "${text}"`);

        const reply = (text: string) => chat.reply(channel, msg.messageID, text);
        const say = (text: string) => chat.say(channel, text);

        const commandContext: BotCommandContext = {
            ...ctx,
            msg,
            reply,
            say,
            cancel,
            params: parseCommandParams(text),
        };

        try {
            await command.run(commandContext);
            console.log(logPrefix, `command ${command.name} executed successfully`);
        } catch (error) {
            const when = Date.now();
            const errorMessage = error instanceof Error ? error.message : 'unknown error';
            console.error(
                logPrefix,
                `error executing command ${command.name} from ${msg.senderUsername} in ${channel} (time: ${when}) ("${text}"): ${errorMessage}`
            );
            console.error(error);

            await reply(`Something went wrong :/ (${when})`).catch();
        }
    },
};
