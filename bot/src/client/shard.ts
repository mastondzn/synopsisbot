import { ChatClient, type ChatClientOptions, LogLevel } from '@twurple/chat';
import chalk from 'chalk';

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
                minLevel: options?.isDev ? 'debug' : 'warning',
                custom: (level, message) => {
                    const logPrefix = chalk.bgGrey(`[chat:${this.shardId}]`);

                    if (level === LogLevel.ERROR) console.error(logPrefix, `[${level}] ${message}`);
                    else if (level === LogLevel.WARNING) {
                        console.warn(logPrefix, `[${level}] ${message}`);
                    } else console.log(logPrefix, `[${level}] ${message}`);
                },
                ...options?.logger,
            },
        });

        this.shardId = clientShardId;
        clientShardId++;
    }
}
