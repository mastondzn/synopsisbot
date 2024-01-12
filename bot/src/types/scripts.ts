import type { ChatClient } from '@kararty/dank-twitch-irc';
import type { Database } from '@synopsis/db';
import type { ApiClient } from '@twurple/api';
import type { Redis } from 'ioredis';

import type { Bot } from '~/bot';

interface Base {
    description?: string
}

type ScriptFunction<K extends string, V> = V extends object
    ? (argument: Record<K, V>) => Promise<void> | void
    : () => Promise<void> | void;

type ScriptTypeBuilder<K extends string, V> = Base & {
    type: K
    run: ScriptFunction<K, V>
};

export type BotScript = ScriptTypeBuilder<'bot', Bot>;
export type DatabaseScript = ScriptTypeBuilder<'db', Database>;
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
