import { captureException } from '@sentry/node';
import { env } from '@synopsis/env/node';

import { commands } from '~/commands';
import type { CommandContext, CommandFragment } from '~/helpers/command';
import { getCommandName, getCommandPermissions } from '~/helpers/command';
import { parseOptions } from '~/helpers/command/options';
import { prefix } from '~/helpers/command/prefix';
import { parseCommand } from '~/helpers/command/simplify';
import { defineEventHandler } from '~/helpers/event';
import { chat } from '~/services/chat';
import { cooldowns } from '~/services/cooldown';
import { db } from '~/services/database';
import { permissions } from '~/services/permissions';
import { cache } from '~/services/redis';

async function hasDevelopmentProcess(): Promise<boolean> {
    const developmentProcess = await cache.get('dev-announce');
    return developmentProcess === 'true';
}

export default defineEventHandler({
    event: 'PRIVMSG',
    handler: async (message) => {
        const text = message.messageText;
        const channel = message.channelName;

        const inDefaultChannel = [env.TWITCH_BOT_OWNER_USERNAME, env.TWITCH_BOT_USERNAME].includes(channel);

        if (!message.messageText.startsWith(prefix)
            || (env.NODE_ENV === 'development' && !inDefaultChannel)) return;

        const wantedCommand = getCommandName(message);
        if (!wantedCommand) return;

        await commands.verify();
        const foundCommand = commands.find(
            c => c.name === wantedCommand || c.aliases?.includes(wantedCommand),
        ) ?? null;
        if (!foundCommand) return;

        const parsed = parseCommand(foundCommand, message);
        if (!parsed) return;
        const { parameters, command } = parsed;

        const wantedPermissions = getCommandPermissions(command);

        const [mode, isOnCooldown, developmentProcessCheck, isPermitted] = await Promise.all([
            db.find.channelModeByLogin(channel),
            // if we're in production and theres a dev process running don't reply to commands in default channels
            cooldowns.isOnCooldown({ command, channel, userName: message.senderUsername }),
            hasDevelopmentProcess().then(
                hasDevelopmentProcess_ =>
                    env.NODE_ENV === 'production' && hasDevelopmentProcess_ && inDefaultChannel,
            ),
            // scuffed
            wantedPermissions.mode === 'custom'
                ? Promise.resolve(true)
                : (wantedPermissions.mode === 'all'
                        ? permissions.pleasesGlobalAndLocal(
                            wantedPermissions.global,
                            wantedPermissions.local,
                            message,
                        )
                        : permissions.pleasesGlobalOrLocal(
                            wantedPermissions.global,
                            wantedPermissions.local,
                            message,
                        )),
        ]);

        const dontExecute: boolean
            = developmentProcessCheck
            || isOnCooldown
            || !isPermitted;

        const cancel = () =>
            cooldowns.clear({ command: foundCommand, channel, userName: message.senderUsername });

        if (!mode) console.warn(`[events:commands] mode for channel ${channel} not found in database`);

        if (dontExecute) {
            await cancel();
            return;
        }

        console.log(
            '[events:commands]',
            `executing command ${foundCommand.name} from ${message.senderUsername} in ${channel}`,
        );
        console.log('[events:commands]', `${message.senderUsername}: "${text}"`);

        const context: CommandContext = {
            options: parseOptions(message, command.options),
            message,
            cancel,
            parameters,
        };

        const consumeFragment = async ({ fragment }: { fragment: CommandFragment; }) => {
            if ('reply' in fragment) {
                return chat.reply(
                    fragment.channel ?? channel,
                    fragment.to?.messageID ?? message.messageID,
                    fragment.reply,
                );
            } else if ('action' in fragment) {
                return chat.me(fragment.channel ?? channel, fragment.action);
            } else if ('say' in fragment) {
                return chat.say(fragment.channel ?? channel, fragment.say);
            }
        };

        try {
            const commandResult = await command.run(context);

            if (!commandResult) {
                //
            } else if (
                'reply' in commandResult
                || 'action' in commandResult
                || 'say' in commandResult
            ) {
                await consumeFragment({ fragment: commandResult });
            } else {
                for await (const fragment of commandResult) {
                    await consumeFragment({ fragment });
                }
            }

            console.log('[events:commands]', `command ${foundCommand.name} executed successfully`);
        } catch (error) {
            captureException(error);

            const when = Date.now();
            const errorMessage = error instanceof Error ? error.message : 'unknown error';
            console.error(
                '[events:commands]',
                `error executing command ${foundCommand.name} from ${message.senderUsername} in ${channel} (time: ${when}) ("${text}"): ${errorMessage}`,
            );
            console.error(error);

            await chat.reply(channel, message.messageID, `Something went wrong :/ (${when})`);
        }
    },
});
