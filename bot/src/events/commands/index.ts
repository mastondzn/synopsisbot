import { captureException } from '@sentry/node';

import { cooldowns } from './cooldowns';
import { locks } from './locks';
import { commands } from '~/commands';
import { CancellationError } from '~/errors/cancellation';
import { UserError } from '~/errors/user';
import { ensurePermitted, ensureValidChannelMode } from '~/helpers/command/checks';
import { consumeFragment } from '~/helpers/command/fragment';
import { getWantedCommand, parseParametersAndOptions } from '~/helpers/command/parameters';
import { prefix } from '~/helpers/command/prefix';
import { simplifyCommand } from '~/helpers/command/simplify';
import type { CommandContext } from '~/helpers/command/types';
import { createEventHandler } from '~/helpers/event';
import { prefixes } from '~/helpers/log-prefixes';
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

        console.log(
            prefixes.commands,
            `#${message.channelName} ${message.senderUsername}: ${text}`,
        );

        try {
            locks.ensure(message.senderUsername);
            cooldowns.ensure(message);

            const command = simplifyCommand(unsimplified, message);

            // Ensure the channel mode is valid for the command, dont want to post where we shouldn't
            await ensureValidChannelMode(message);

            if (!command) {
                throw new UserError({
                    message:
                        'No valid subcommand was provided. Please see the command info for the correct usage.',
                });
            }

            await ensurePermitted(message, command);

            const { options, parameters } = parseParametersAndOptions(message, command);

            const context: CommandContext = {
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
                const response =
                    error.options.message ??
                    'Looks like you did something wrong :/ (no additional info was provided)';
                await chat.reply(channel, message.messageID, response);
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
