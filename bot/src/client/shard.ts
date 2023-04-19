import { ChatClient, type ChatClientOptions } from '@twurple/chat';

let clientShardId = 0;

type ExtraOptions = { isDev?: boolean } | undefined;
export type ChatClientShardOptions = ChatClientOptions & ExtraOptions;

// 85 channels per shard
export class ChatClientShard extends ChatClient {
    shardId: number;

    constructor(options?: ChatClientShardOptions) {
        super({
            ...options,
            logger: {
                name: `chat:${clientShardId}`,
                ...options?.logger,
            },
        });

        this.shardId = clientShardId;
        clientShardId++;
    }
}
