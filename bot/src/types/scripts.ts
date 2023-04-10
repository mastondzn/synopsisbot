import { type ApiClient } from '@twurple/api';
import { type ChatClient } from '@twurple/chat/lib';
import { type NodePgDatabase } from 'drizzle-orm/node-postgres';
import { type Redis } from 'ioredis';

import { type Bot } from '~/bot';

type Base = {
    description?: string;
};

type ScriptFunction<K extends string, V> = (arg: Record<K, V>) => Promise<void> | void;

type ScriptBuilder<K extends string, V> = Base & {
    type: K;
    run: ScriptFunction<K, V>;
};

export type BotScript = ScriptBuilder<'bot', Bot>;
export type DatabaseScript = ScriptBuilder<'db', NodePgDatabase>;
export type CacheScript = ScriptBuilder<'cache', Redis>;
export type TwitchApiScript = ScriptBuilder<'api', ApiClient>;
export type TwitchChatScript = ScriptBuilder<'chat', ChatClient>;
export type StandaloneScript = ScriptBuilder<'standalone', void>;

export type Script =
    | BotScript
    | DatabaseScript
    | CacheScript
    | TwitchApiScript
    | TwitchChatScript
    | StandaloneScript;
