import { type BotEventHandler } from '~/types/client';
import { CommandCooldownManager } from '~/utils/cooldown';

const botPrefix = 'sb';
const hasSpaceAfterPrefix = true as boolean;
const commandExecutionRegex = new RegExp('^' + botPrefix + (hasSpaceAfterPrefix ? ' ' : ''));

let cooldownManager: CommandCooldownManager | undefined;

export const event: BotEventHandler = {
    event: 'onMessage',
    handler: async ({
        params: [channel, userName, text, msg],
        db,
        client,
        commands,
        cache,
        api,
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
        if (!command) return;

        const contextClient = client.getClientByChannel(channel);
        // TODO: do something better if this client is not found
        if (!contextClient) return;

        if (!cooldownManager) cooldownManager = new CommandCooldownManager({ cache });

        const { isOnCooldown } = await cooldownManager.check({
            command,
            channel,
            userName,
        });
        if (isOnCooldown) return;

        const commandExecutionContext = {
            msg: Object.assign(msg, {
                channel,
                userName,
                text,
            }),
            client: contextClient,
            api,
            db,
            shardedClient: client,
            commands,
            cache,
        };

        await command.run(commandExecutionContext);
    },
};
