import { EventEmitter } from 'node:events';

import { Collection } from '@discordjs/collection';
import { type ChatSayMessageAttributes } from '@twurple/chat';
import chalk from 'chalk';
import type TypedEmitter from 'typed-emitter';

import { ChatClientShard, type ChatClientShardOptions } from './shard';
import { type BasicEventHandler } from '~/types/client';
import { type Resolvable } from '~/types/general';

export type ShardedChatClientOptions = ChatClientShardOptions & {
    channels?: Resolvable<string | string[]>;
};

const logPrefix = chalk.bgGreen('[sharded-client]');

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
export type ShardedChatClientEvents = {
    spawn: (shard: ChatClientShard) => void;
    kill: (shardId: number) => void;
    join: (eventContext: { shard: ChatClientShard; channel: string }) => void;
    part: (eventContext: { shard: ChatClientShard; channel: string }) => void;
    say: (eventContext: { shard: ChatClientShard; channel: string; text: string }) => void;
};

export class ShardedChatClient extends (EventEmitter as new () => TypedEmitter<ShardedChatClientEvents>) {
    private shards: Collection<number, ChatClientShard>;
    private events: BasicEventHandler[] = [];

    private options: ShardedChatClientOptions;
    private baseShardOptions: ChatClientShardOptions;

    constructor(options: ShardedChatClientOptions) {
        super();

        this.on('say', ({ shard, channel, text }) =>
            console.log(logPrefix, `said "${text}" in ${channel} on shard`, shard.shardId)
        );
        this.on('spawn', (shard) => console.log(logPrefix, `spawned new shard`, shard.shardId));
        this.on('join', ({ shard, channel }) =>
            console.log(logPrefix, `joined channel ${channel}, on shard`, shard.shardId)
        );
        this.on('part', ({ shard, channel }) =>
            console.log(logPrefix, `parted channel ${channel}, on shard`, shard.shardId)
        );
        this.on('kill', (shardId) => console.log(logPrefix, `killed shard`, shardId));

        this.options = options;
        this.shards = new Collection();

        const baseClientOptions: ChatClientShardOptions = { ...options, channels: [] };
        this.baseShardOptions = baseClientOptions;

        const channels = this.options.channels;
        if (channels) void this.join(channels);
    }

    spawnShard(options: ChatClientShardOptions = this.baseShardOptions): ChatClientShard {
        if (Array.isArray(options.channels)) options.channels = [];
        const client = new ChatClientShard(options);
        for (const { event, handler } of this.events) {
            client[event](handler as never);
        }

        this.shards.set(client.shardId, client);
        this.emit('spawn', client);
        return client;
    }

    killShard(options: { shard: ChatClientShard } | { shardId: number }) {
        if ('shard' in options) {
            const shard = options.shard;
            shard.quit();
            this.shards.delete(shard.shardId);
        } else {
            const shard = this.shards.get(options.shardId);
            if (!shard) return;
            shard.quit();
            this.shards.delete(shard.shardId);
        }
    }

    registerEvent(eventToAdd: BasicEventHandler) {
        this.events.push(eventToAdd);

        for (const [, client] of this.shards) {
            const { event, handler } = eventToAdd;
            client[event](handler as never);
        }
    }

    getShardById(id: number) {
        return this.shards.get(id);
    }

    getShardByChannel(channelName: string) {
        return this.shards.find((client) =>
            client.currentChannels.includes(`#${channelName}`.replace(/^#+/, '#'))
        );
    }

    async join(channels: Resolvable<string | string[]>): Promise<void> {
        const shardsWithAvailableSlots = this.shards
            .filter((shard) => shard.currentChannels.length < 85)
            .map((shard) => ({
                shard,
                slots: 85 - shard.currentChannels.length,
            }));

        // resolve channels
        channels = typeof channels === 'function' ? channels() : channels;
        channels = channels instanceof Promise ? await channels : channels;
        channels = Array.isArray(channels) ? channels : [channels];
        channels = channels.filter((channel) => !this.currentChannels.includes(channel));

        const promises: Promise<void>[] = [];

        for (const { shard, slots } of shardsWithAvailableSlots) {
            const channelsToJoin = channels.slice(0, slots);
            channels = channels.slice(slots);
            promises.push(
                ...channelsToJoin.map(async (channel) => {
                    this.emit('join', { shard, channel });
                    await shard.join(channel);
                })
            );
        }

        if (channels.length === 0) return;

        // pick 85 channels at a time
        const chunks: string[][] = [];
        for (let i = 0; i < channels.length; i += 85) {
            chunks.push(channels.slice(i, i + 85));
        }

        for (const chunk of chunks) {
            const shard = this.spawnShard();
            await shard.connect();
            promises.push(
                ...chunk.map(async (channel) => {
                    this.emit('join', { shard, channel });
                    await shard.join(channel);
                })
            );
        }

        await Promise.all(promises);
    }

    async part(channels: Resolvable<string[] | string>): Promise<void> {
        // resolve channels
        channels = typeof channels === 'function' ? channels() : channels;
        channels = channels instanceof Promise ? await channels : channels;
        channels = Array.isArray(channels) ? channels : [channels];
        channels = channels.map((channel) => `#${channel}`.replace(/^#+/, '#'));

        const _channels = channels;

        for (const [, shard] of this.shards) {
            const channelsToPart = shard.currentChannels.filter((channel) => {
                return _channels.includes(`#${channel}`) || _channels.includes(channel);
            });

            for (const channelToPart of channelsToPart) {
                this.emit('part', { shard, channel: channelToPart });
                shard.part(channelToPart);
            }
        }
    }

    async destroy(): Promise<void> {
        await Promise.all(this.shards.map((client) => client.quit()));
    }

    async say(channel: string, text: string, attributes?: ChatSayMessageAttributes): Promise<void> {
        const shard = this.getShardByChannel(channel);
        if (!shard) throw new Error(`No client found for channel ${channel}`);

        this.emit('say', { shard, channel, text });
        return await shard.say(channel, text, attributes);
    }

    async action(channel: string, text: string): Promise<void> {
        const client = this.getShardByChannel(channel);
        if (!client) throw new Error(`No client found for channel ${channel}`);

        return await client.action(channel, text);
    }

    get currentChannels(): string[] {
        // eslint-disable-next-line unicorn/no-array-reduce
        return this.shards.reduce<string[]>((acc, shard) => [...acc, ...shard.currentChannels], []);
    }

    get shardCount() {
        return this.shards.size;
    }
}
