import { type ApiClient } from '@twurple/api';
import { type ChatClient } from '@twurple/chat';
import { type Redis } from 'ioredis';

import { type NodePgDatabase } from '@synopsis/db';

import { type Bot } from '~/bot';

interface Base {
    description?: string;
}

type ScriptFunction<K extends string, V> = V extends object
    ? (arg: Record<K, V>) => Promise<void> | void
    : () => Promise<void> | void;

type ScriptTypeBuilder<K extends string, V> = Base & {
    type: K;
    run: ScriptFunction<K, V>;
};

export type BotScript = ScriptTypeBuilder<'bot', Bot>;
export type DatabaseScript = ScriptTypeBuilder<'db', NodePgDatabase>;
export type CacheScript = ScriptTypeBuilder<'cache', Redis>;
export type TwitchApiScript = ScriptTypeBuilder<'api', ApiClient>;
export type TwitchChatScript = ScriptTypeBuilder<'chat', ChatClient>;
export type StandaloneScript = ScriptTypeBuilder<'standalone', void>;

export type Script =
    | BotScript
    | DatabaseScript
    | CacheScript
    | TwitchApiScript
    | TwitchChatScript
    | StandaloneScript;
