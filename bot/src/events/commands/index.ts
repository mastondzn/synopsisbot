import { captureException } from '@sentry/node';

import { cooldowns } from './cooldowns';
import { locks } from './locks';
import { commands } from '~/commands';
import { CancellationError } from '~/errors/cancellation';
import { UserError } from '~/errors/user';
import { ensurePermitted, ensureValidChannelMode } from '~/helpers/command/checks';
import { consumeFragment } from '~/helpers/command/fragment';
import { getWantedCommand, parseParameters } from '~/helpers/command/parameters';
import { prefix } from '~/helpers/command/prefix';
import { simplifyCommand } from '~/helpers/command/simplify';
import type { CommandContext } from '~/helpers/command/types';
import { createEventHandler } from '~/helpers/event';
import { logger } from '~/helpers/logger';
import { chat } from '~/services/chat';

export default createEventHandler({
    event: 'PRIVMSG',
    handler: async (message) => {
        const text = message.messageText;
        const channel = message.channelName;
        if (!text.startsWith(prefix)) return;

        const wanted = getWantedCommand(message);
        if (!wanted) return;

        const unsimplified = commands.findByName(wanted);
        if (!unsimplified) return;

        logger.commands(`#${message.channelName} ${message.senderUsername}: ${text}`);

        try {
            locks.ensure(message.senderUsername);
            cooldowns.ensure(message);

            const command = simplifyCommand(unsimplified, message);

            // Ensure the channel mode is valid for the command, dont want to post where we shouldn't
            await ensureValidChannelMode(message);

            if (!command) {
                throw new UserError(
                    'No valid subcommand was provided. Please see the command info for the correct usage.',
                );
            }

            await ensurePermitted(message, command);

            const {
                options,
                parameters,
                arguments: args,
            } = await parseParameters(message, command);

            const context: CommandContext = {
                user: {
                    id: message.senderUserID,
                    login: message.senderUsername,
                    displayName: message.displayName,
                },
                channel: {
                    id: message.channelID,
                    login: message.channelName,
                },
                args,
                message,
                options,
                parameters,
            };

            const result = await command.run(context);

            if ('next' in result) {
                for await (const fragment of result) {
                    await consumeFragment(fragment, message);
                }
            } else {
                await consumeFragment(result, message);
            }
        } catch (error) {
            if (error instanceof CancellationError) {
                // do nothing
            } else if (error instanceof UserError) {
                await chat.reply(channel, message.messageID, error.message);
            } else {
                const id = captureException(error, {
                    tags: {
                        user: `${message.senderUsername}(${message.senderUserID})`,
                        channel: `${channel}(${message.channelID})`,
                        text: message.messageText,
                    },
                });
                const response = `An unexpected error occured :/ (id:${id})`;
                await chat.reply(channel, message.messageID, response);
                console.error(error);
            }
        } finally {
            locks.release(message.senderUsername);
            cooldowns.addCooldown(message, unsimplified);
        }
    },
});
