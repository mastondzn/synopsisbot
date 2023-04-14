import { Collection } from '@discordjs/collection';
import { type ChatSayMessageAttributes } from '@twurple/chat';

import { type BasicEventHandler } from '~/types/client';
import { type Resolvable } from '~/types/general';

import { ChatClientShard, type ChatClientShardOptions } from './shard';

export type ShardedChatClientOptions = ChatClientShardOptions & {
    initialClients?: Collection<number, ChatClientShard>;
    channels?: Resolvable<string | string[]>;
};

export class ShardedChatClient {
    clients: Collection<number, ChatClientShard>;
    events: BasicEventHandler[] = [];

    options: ShardedChatClientOptions;
    baseClientOptions: ChatClientShardOptions;

    constructor(options: ShardedChatClientOptions) {
        this.options = options;

        const baseClientOptions: ChatClientShardOptions = { ...options, channels: [] };
        this.baseClientOptions = baseClientOptions;

        this.clients = options.initialClients ?? new Collection();
        if (!options?.channels?.length || options?.channels?.length < 1) {
            throw new Error('No channels provided');
        }

        const channels = this.options?.channels;
        if (channels) void this.join(channels);
    }

    spawnClient(options: ChatClientShardOptions = this.baseClientOptions): ChatClientShard {
        if (Array.isArray(options.channels)) options.channels = [];
        const client = new ChatClientShard(options);
        for (const { event, handler } of this.events) {
            // @ts-expect-error ts doesn't realize the handler is actually corresponding to the event
            client[event](handler);
        }

        this.clients.set(client.shardId, client);
        return client;
    }

    registerEvent(eventToAdd: BasicEventHandler) {
        this.events.push(eventToAdd);

        for (const [, client] of this.clients) {
            const { event, handler } = eventToAdd;

            // @ts-expect-error ts doesn't realize the handler is actually corresponding to the event
            client[event](handler);
        }
    }

    getClientByChannel(channelName: string) {
        return this.clients.find((client) =>
            client.currentChannels.includes(`#${channelName}`.replace(/^#+/, '#'))
        );
    }

    async join(channels: Resolvable<string | string[]>): Promise<void> {
        const clientsWithAvailableSlots = this.clients
            .filter((client) => client.currentChannels.length < 85)
            .map((client) => ({
                client,
                slots: 85 - client.currentChannels.length,
            }));

        // resolve channels
        channels = typeof channels === 'function' ? channels() : channels;
        channels = channels instanceof Promise ? await channels : channels;
        channels = Array.isArray(channels) ? channels : [channels];

        const promises: Promise<void>[] = [];

        for (const { client, slots } of clientsWithAvailableSlots) {
            const channelsToJoin = channels.slice(0, slots);
            channels = channels.slice(slots);
            promises.push(...channelsToJoin.map((channel) => client.join(channel)));
        }

        if (channels.length === 0) return;

        // pick 85 channels at a time
        const chunks: string[][] = [];
        for (let i = 0; i < channels.length; i += 85) {
            chunks.push(channels.slice(i, i + 85));
        }

        for (const chunk of chunks) {
            const client = this.spawnClient();
            await client.connect();
            promises.push(...chunk.map((channel) => client.join(channel)));
        }

        await Promise.all(promises);
    }

    part(channel: string) {
        const client = this.getClientByChannel(channel);
        if (!client) throw new Error(`No client found for channel ${channel}`);

        client.part(channel);
    }

    partAll(channels: string[]) {
        const channelsAlreadyLeft: Set<string> = new Set();

        for (const channel of channels) {
            if (channelsAlreadyLeft.has(channel)) continue;

            const client = this.getClientByChannel(channel);
            if (!client) throw new Error(`No client found for channel ${channel}`);

            // check if this client has multiple of the wanted channels
            const channelsToPart = client.currentChannels.filter((channel) =>
                channels.includes(channel)
            );

            for (const channelToPart of channelsToPart) {
                client.part(channelToPart);
                channelsAlreadyLeft.add(channelToPart);
            }
        }
    }

    async destroy(): Promise<void> {
        await Promise.all(this.clients.map((client) => client.quit()));
    }

    async say(channel: string, text: string, attributes?: ChatSayMessageAttributes): Promise<void> {
        const client = this.getClientByChannel(channel);
        if (!client) throw new Error(`No client found for channel ${channel}`);

        return await client.say(channel, text, attributes);
    }

    async action(channel: string, text: string): Promise<void> {
        const client = this.getClientByChannel(channel);
        if (!client) throw new Error(`No client found for channel ${channel}`);

        return await client.action(channel, text);
    }

    get currentChannels(): string[] {
        // eslint-disable-next-line unicorn/no-array-reduce
        return this.clients.reduce<string[]>(
            (acc, client) => [...acc, ...client.currentChannels],
            []
        );
    }
}
