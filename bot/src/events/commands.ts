import chalk from 'chalk';

import { type BotEventHandler } from '~/types/client';
import { CommandCooldownManager } from '~/utils/cooldown';

const botPrefix = 'sb';
const hasSpaceAfterPrefix = true as boolean;
const commandExecutionRegex = new RegExp('^' + botPrefix + (hasSpaceAfterPrefix ? ' ' : ''));

let cooldownManager: CommandCooldownManager | undefined;

const logPrefix = chalk.bgBlue('[events:commands]');

export const event: BotEventHandler = {
    event: 'onMessage',
    handler: async ({
        params: [channel, userName, text, msg],
        db,
        client,
        cache,
        api,
        commands,
        events,
        modules,
    }) => {
        // eslint-disable-next-line @typescript-eslint/prefer-string-starts-ends-with
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

        const contextShard = client.getShardByChannel(channel);
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

        const context = {
            msg: Object.assign(msg, {
                channel,
                userName,
                text,
            }),
            api,
            db,
            client,
            commands,
            cache,
            events,
            modules,
        };

        try {
            await command.run(context);
            console.log(`${logPrefix} command ${command.name} executed successfully`);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'unknown error';
            console.error(
                `${logPrefix} error executing command ${command.name} from ${userName} in ${channel} ("${text}"): ${errorMessage}`
            );
            await client
                .say(
                    channel,
                    `@${msg.userInfo.displayName}, I failed to execute that command :/ (${errorMessage})`,
                    {
                        replyTo: msg.id,
                    }
                )
                .catch((error) => {
                    const errorMessage = error instanceof Error ? error.message : 'unknown error';
                    console.error(
                        `${logPrefix} error sending error message to ${userName} in ${channel}: ${errorMessage}`
                    );
                });
        }
    },
};
