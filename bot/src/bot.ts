import { type Collection } from '@discordjs/collection';
import { AlternateMessageModifier, ChatClient } from '@kararty/dank-twitch-irc';
import { ApiClient } from '@twurple/api';
import { EventSubWsListener } from '@twurple/eventsub-ws';
import chalk from 'chalk';
import { Redis } from 'ioredis';

import { type NodePgDatabase, type Pool } from '@synopsis/db';
import { env } from '@synopsis/env/node';

import { type BotAuthProvider } from './auth-provider';
import {
    type BotCommand,
    type BotEventHandler,
    type BotModule,
    type BotUtils,
} from './types/client';
import { CommandCooldownManager } from './utils/cooldown';
import { IdLoginPairProvider } from './utils/id-login-pair';
import { LiveStatusManager } from './utils/live-manager';
import { PermissionProvider } from './utils/permissions';
import { PrometheusExposer } from './utils/prometheus';

const logPrefix = chalk.bgCyanBright('[bot]');

export interface BotOptions {
    events: Collection<string, BotEventHandler>;
    commands: Collection<string, BotCommand>;
    modules: Collection<string, BotModule>;
    authProvider: BotAuthProvider;
    botToken: string;
    db: NodePgDatabase;
    pool: Pool;
}

export class Bot {
    chat: ChatClient;
    api: ApiClient;
    authProvider: BotAuthProvider;
    eventSub: EventSubWsListener;

    db: NodePgDatabase;
    pool: Pool;
    cache: Redis;

    events: Collection<string, BotEventHandler>;
    commands: Collection<string, BotCommand>;
    modules: Collection<string, BotModule>;
    utils: BotUtils;

    constructor({ events, commands, modules, db, pool, botToken, authProvider }: BotOptions) {
        this.db = db;
        this.pool = pool;

        this.cache = new Redis({
            host: env.REDIS_HOST,
            password: env.REDIS_PASSWORD,
        });
        console.log(logPrefix, `cache connection created`);

        this.events = events;
        this.commands = commands;
        this.modules = modules;

        this.db = db;
        this.pool = pool;

        this.authProvider = authProvider;
        console.log(logPrefix, `auth provider initialized`);

        this.api = new ApiClient({ authProvider: this.authProvider });
        console.log(logPrefix, `api client initialized`);

        this.chat = new ChatClient({
            username: env.TWITCH_BOT_USERNAME,
            password: `oauth:${botToken}`,
            rateLimits: 'default',
        });
        this.chat.use(new AlternateMessageModifier(this.chat));
        console.log(logPrefix, `chat client initialized`);

        this.eventSub = new EventSubWsListener({
            apiClient: this.api,
        });
        console.log(logPrefix, `eventsub client initialized`);

        this.utils = {
            cooldownManager: new CommandCooldownManager(this.cache),
            statusManager: new LiveStatusManager(this.api, this.cache),
            prometheus: new PrometheusExposer(),
            idLoginPairs: new IdLoginPairProvider(this.cache, this.api),
            permissions: new PermissionProvider(this.cache, this.db),
        };
        console.log(logPrefix, `utils initialized`);

        this.registerEvents();

        void this.registerModules();
    }

    private registerEvents(): void {
        for (const [, { event, handler }] of this.events) {
            this.chat.on(event, (...params) => {
                void handler({ ...this, params: params as never } as never);
            });
        }
    }

    private async registerModules(): Promise<void> {
        const orderedModules = [...this.modules.values()].sort((a, b) => {
            if (!('priority' in a) && !('priority' in b)) return 0;
            if (!('priority' in a)) return 1;
            if (!('priority' in b)) return -1;
            if (a.priority === b.priority) return 0;
            return a.priority < b.priority ? 1 : -1;
        });

        for (const module of orderedModules) {
            await module.register(this);
            console.log(logPrefix, `module ${chalk.cyanBright(module.name)} registered`);
        }
    }

    async stop(): Promise<void> {
        await Promise.all([this.cache.quit(), this.pool.end(), this.chat.destroy()]);
    }
}
