import { ChatClient, type ChatClientOptions } from '@twurple/chat';

let clientShardId = 0;

type ExtraOptions = { isDev?: boolean } | undefined;
export type ChatClientShardOptions = ChatClientOptions & ExtraOptions;

// max 85 channels per shard

export class ChatClientShard extends ChatClient {
    shardId: number;
    latency: number | null;

    constructor(options?: ChatClientShardOptions) {
        super({
            ...options,
            logger: {
                name: `chat:${clientShardId}`,
                minLevel: 'debug',
                timestamps: false,
                emoji: false,
                colors: false,
                ...options?.logger,
            },
        });

        this.shardId = clientShardId;
        this.latency = null;
        // TODO: snipe logger to add latency
        clientShardId++;
    }
}
