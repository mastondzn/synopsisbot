import { Collection } from '@discordjs/collection';
import { type ChatSayMessageAttributes } from '@twurple/chat';

import { type BaseEvent } from '~/types/client';

import { ChatClientShard, type ChatClientShardOptions } from './shard';

export type ShardedChatClientOptions = {
    initialClients?: Collection<number, ChatClientShard>;
    initialEvents?: BaseEvent[];
} & ChatClientShardOptions;

export class ShardedChatClient {
    clients: Collection<number, ChatClientShard>;
    events: BaseEvent[];

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

        this.events = options.initialEvents ?? [];
        for (const event of this.events) {
            this.registerEvent(event);
        }
    }

    createClient(options: ChatClientShardOptions = this.baseClientOptions): ChatClientShard {
        if (Array.isArray(options.channels)) options.channels = [];
        const client = new ChatClientShard(options);
        for (const event of this.events) {
            this.registerEventOnClient(client, event);
        }

        this.clients.set(client.shardId, client);
        return client;
    }

    registerEvent(eventToAdd: BaseEvent) {
        this.events.push(eventToAdd);

        for (const [, client] of this.clients) {
            this.registerEventOnClient(client, eventToAdd);
        }
    }

    registerEventOnClient(client: ChatClientShard, eventToAdd: BaseEvent) {
        const { event, handler } = eventToAdd;
        switch (event) {
            case 'onMessage': {
                client.onMessage(handler);
                break;
            }
            case 'onJoin': {
                client.onJoin(handler);
                break;
            }
            default: {
                throw new Error(`Event ${event} is not implemented`);
            }
        }
    }

    getClientByChannel(channelName: string) {
        return this.clients.find((client) =>
            client.currentChannels.includes(`#${channelName}`.replace(/^#+/, '#'))
        );
    }

    async join(channel: string): Promise<ChatClientShard> {
        const existing = this.getClientByChannel(channel);
        if (existing) return existing;

        const availableClient = this.clients.find((client) => client.currentChannels.length < 85);
        if (availableClient) {
            await availableClient.join(channel);
            return availableClient;
        }

        const newClient = this.createClient();
        await newClient.connect();
        await newClient.join(channel);
        return newClient;
    }

    async joinAll(channels: string[]): Promise<void> {
        const clientsWithAvailableSlots = this.clients
            .filter((client) => client.currentChannels.length < 85)
            .map((client) => ({
                client,
                slots: 85 - client.currentChannels.length,
            }));

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

            for (const channel of channelsToPart) {
                client.part(channel);
                channelsAlreadyLeft.add(channel);
            }
        }
    }

    async destroy(): Promise<void> {
        await Promise.all(this.clients.map((client) => client.quit()));
    }

    say(channel: string, text: string, attributes?: ChatSayMessageAttributes): Promise<void> {
        const client = this.getClientByChannel(channel);
        if (!client) throw new Error(`No client found for channel ${channel}`);

        return client.say(channel, text, attributes);
    }

    action(channel: string, text: string): Promise<void> {
        const client = this.getClientByChannel(channel);
        if (!client) throw new Error(`No client found for channel ${channel}`);

        return client.action(channel, text);
    }

    get currentChannels(): string[] {
        // eslint-disable-next-line unicorn/no-array-reduce
        return this.clients.reduce<string[]>(
            (acc, client) => [...acc, ...client.currentChannels],
            []
        );
    }
}
