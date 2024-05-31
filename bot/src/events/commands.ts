import { captureException } from '@sentry/node';
import locatePromise from 'p-locate';
import { Lock } from 'semaphore-async-await';

import { commands } from '~/commands';
import { type CommandContext, getCommandName } from '~/helpers/command';
import {
    developmentIsNotRunning,
    isNotOnCooldown,
    isPermitted,
    isValidChannelMode,
} from '~/helpers/command/checks';
import { consumeFragment } from '~/helpers/command/fragment';
import { prefix } from '~/helpers/command/prefix';
import { parseCommand } from '~/helpers/command/simplify';
import { createEventHandler } from '~/helpers/event';
import { prefixes } from '~/helpers/log-prefixes';
import { cooldowns } from '~/providers';
import { chat } from '~/services';

const semaphores = new Map<string, Lock>();

export default createEventHandler({
    event: 'PRIVMSG',
    handler: async (message) => {
        const text = message.messageText;
        const channel = message.channelName;
        if (!text.startsWith(prefix)) return;

        const wanted = getCommandName(text);
        if (!wanted) return;

        const commandFound = commands.findByName(wanted);
        if (!commandFound) return;

        const parsed = parseCommand(commandFound, message);
        if (!parsed) return;
        const command = parsed.command;
        const parameters = parsed.parameters;

        const semaphore = semaphores.get(message.senderUsername) ?? new Lock();
        semaphores.set(message.senderUsername, semaphore);

        const isReleased = semaphore.tryAcquire();
        if (!isReleased) return;

        // TODO: instead of this we should just throw "user" errors and catch them
        const checks = [
            isValidChannelMode(message),
            isNotOnCooldown(message),
            developmentIsNotRunning(message),
            isPermitted(message, command),
        ] as const;

        // if result is true, it means the check passed, so we dont want to locate
        // because we want to exit as soon as possible
        const located = await locatePromise(checks, (result) => !result);
        // if any of the checks failed (found), we don't execute the command
        if (typeof located === 'boolean') {
            // release the semaphore for this user
            semaphore.release();
            return;
        }

        console.log(
            prefixes.commands,
            `#${message.channelName} ${message.senderUsername}: ${text}`,
        );

        const context: CommandContext = {
            message,
            parameters,
        };

        try {
            const commandResult = await command.run(context);

            if ('reply' in commandResult || 'action' in commandResult || 'say' in commandResult) {
                await consumeFragment(commandResult, message);
            } else {
                for await (const fragment of commandResult) {
                    await consumeFragment(fragment, message);
                }
            }
        } catch (error) {
            captureException(error);

            const when = Date.now();
            const errorMessage = error instanceof Error ? error.message : 'unknown error';
            console.error(
                '[events:commands]',
                `error executing command ${commandFound.name} from ${message.senderUsername} in ${channel} (time: ${when}) ("${text}"): ${errorMessage}`,
            );
            console.error(error);

            await chat.reply(channel, message.messageID, `Something went wrong :/ (${when})`);
        } finally {
            semaphore.release();
            cooldowns.addCooldown(message, command);
        }
    },
});
