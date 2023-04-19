import chalk from 'chalk';

import { type BotCommandContext, type BotEventHandler } from '~/types/client';
import { CommandCooldownManager } from '~/utils/cooldown';

const botPrefix = 'sb';
const hasSpaceAfterPrefix = true as boolean;
const commandExecutionRegex = new RegExp('^' + botPrefix + (hasSpaceAfterPrefix ? ' ' : ''));

let cooldownManager: CommandCooldownManager | undefined;

const logPrefix = chalk.bgBlue('[events:commands]');

export const event: BotEventHandler = {
    event: 'onMessage',
    handler: async (ctx) => {
        const { params, chat, cache, commands } = ctx;
        const [channel, userName, text, msg] = params;

        if (!commandExecutionRegex.test(text)) return;

        const commandIdentifier = (
            hasSpaceAfterPrefix
                ? text.replace(/ +/g, ' ').split(' ')[1]
                : text
                      .replace(new RegExp(`^${botPrefix}`), '')
                      .replace(/ +/g, ' ')
                      .split(' ')[0]
        )?.toLowerCase();
        if (!commandIdentifier) return;

        const command = commands.find(
            (c) => c.name === commandIdentifier || c.aliases?.includes(commandIdentifier)
        );
        if (!command) {
            console.log(
                `${logPrefix} no relevant command found for ${commandIdentifier} from ${userName} in ${channel}: "${text}"`
            );
            return;
        }

        console.log(
            `${logPrefix} executing command ${command.name} from ${userName} in ${channel}`
        );
        console.log(`${logPrefix} message: ${userName}: "${text}"`);

        const contextShard = chat.getShardByChannel(channel);
        if (!contextShard) {
            console.error(`${logPrefix} no client found for this command execution ${channel}`);
            return;
        }

        if (!cooldownManager) {
            console.log(`${logPrefix} initializing cooldown manager`);
            cooldownManager = new CommandCooldownManager({ cache });
        }

        const { isOnCooldown } = await cooldownManager.check({
            command,
            channel,
            userName,
        });
        if (isOnCooldown) {
            console.log(`${logPrefix} command ${command.name} used by ${userName} is on cooldown`);
            return;
        }

        const commandContext: BotCommandContext = {
            ...ctx,
            msg: Object.assign(msg, {
                channel,
                userName,
                text,
            }),
        };

        try {
            await command.run(commandContext);
            console.log(`${logPrefix} command ${command.name} executed successfully`);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'unknown error';
            console.error(
                `${logPrefix} error executing command ${command.name} from ${userName} in ${channel} ("${text}"): ${errorMessage}`
            );

            const errorMessageToChat = `@${msg.userInfo.displayName}, something went wrong :/ (${errorMessage})`;
            await chat.say(channel, errorMessageToChat, { replyTo: msg }).catch((error) => {
                const errorMessage = error instanceof Error ? error.message : 'unknown error';
                console.error(
                    `${logPrefix} error sending error message to ${userName} in ${channel}: ${errorMessage}`
                );
            });
        }
    },
};
