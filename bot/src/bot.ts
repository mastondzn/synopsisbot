import { type Collection } from '@discordjs/collection';
import { ApiClient } from '@twurple/api';
import { EventSubWsListener } from '@twurple/eventsub-ws';
import chalk from 'chalk';
import { Redis } from 'ioredis';

import { makeDatabase, type NodePgDatabase, type Pool } from '@synopsis/db';

import { type BotAuthProvider, makeBotAuthProvider } from './auth-provider';
import { ShardedChatClient } from './client';
import {
    type BotCommand,
    type BotEventHandler,
    type BotModule,
    type BotUtils,
} from './types/client';
import { CommandCooldownManager } from './utils/cooldown';
import { LiveStatusManager } from './utils/live-manager';
import { env } from '~/utils/env';

const logPrefix = chalk.bgCyanBright('[bot]');

export interface BotOptions {
    events: Collection<string, BotEventHandler>;
    commands: Collection<string, BotCommand>;
    modules: Collection<string, BotModule>;
}

export class Bot {
    chat!: ShardedChatClient;
    api!: ApiClient;
    authProvider!: BotAuthProvider;
    eventSub!: EventSubWsListener;

    db: NodePgDatabase;
    pool: Pool;

    cache: Redis;

    events: Collection<string, BotEventHandler>;
    commands: Collection<string, BotCommand>;
    modules: Collection<string, BotModule>;
    utils!: BotUtils;

    constructor({ events, commands, modules }: BotOptions) {
        const { db, pool } = makeDatabase({
            host: env.DB_HOST,
            user: env.DB_USERNAME,
            password: env.DB_PASSWORD,
            database: env.DB_NAME,
        });
        console.log(`${logPrefix} database connection created`);

        this.cache = new Redis({
            host: env.REDIS_HOST,
            password: env.REDIS_PASSWORD,
        });
        console.log(`${logPrefix} cache connection created`);

        this.events = events;
        this.commands = commands;
        this.modules = modules;

        this.db = db;
        this.pool = pool;
    }

    async initialize() {
        this.authProvider = await makeBotAuthProvider({
            db: this.db,
            botId: env.TWITCH_BOT_ID,
            clientId: env.TWITCH_CLIENT_ID,
            clientSecret: env.TWITCH_CLIENT_SECRET,
        });
        console.log(`${logPrefix} auth provider initialized`);

        this.api = new ApiClient({ authProvider: this.authProvider });
        console.log(`${logPrefix} api client initialized`);

        this.chat = new ShardedChatClient({
            authProvider: this.authProvider,
            isDev: env.NODE_ENV === 'development',
        });
        console.log(`${logPrefix} chat client initialized`);

        this.eventSub = new EventSubWsListener({
            apiClient: this.api,
        });
        console.log(`${logPrefix} eventsub client initialized`);

        this.utils = {
            cooldownManager: new CommandCooldownManager(this.cache),
            statusManager: new LiveStatusManager(this.api, this.cache),
        };
        console.log(`${logPrefix} utils initialized`);

        for (const [, { event, handler }] of this.events) {
            this.chat.registerEvent({
                event,
                handler: (...args: unknown[]) => {
                    return void handler({
                        ...this,
                        params: args as never,
                    });
                },
            } as never);
        }

        for (const [, module] of this.modules) {
            void module.register(this);
            console.log(`${logPrefix} module ${chalk.cyanBright(module.name)} registered`);
        }
    }

    async stop(): Promise<void> {
        await Promise.all([this.cache.quit(), this.pool.end(), this.chat.destroy()]);
    }
}
