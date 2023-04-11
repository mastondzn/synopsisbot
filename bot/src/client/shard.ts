import { ChatClient, type ChatClientOptions } from '@twurple/chat';

let clientShardId = 0;

type ExtraOptions = { isDev?: boolean } | undefined;
export type ChatClientShardOptions = ChatClientOptions & ExtraOptions;

// max 85 channels per shard

export class ChatClientShard extends ChatClient {
    shardId = clientShardId;

    constructor(options?: ChatClientShardOptions) {
        clientShardId++;

        super({
            logger: {
                name: `twurple:chat:client:${clientShardId}`,
                minLevel: options?.isDev ? 'info' : 'error',
            },
            ...options,
        });
    }
}
