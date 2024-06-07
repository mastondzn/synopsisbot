import chalk from 'chalk';

const entries = {
    rpc: '[services:rpc]',
    chat: '[services:chat]',
    auth: '[services:auth]',
    channels: '[modules:channels]',
    refresh: '[crons:refresh]',
    commands: '[events:commands]',
    init: '[events:init]',
    joins: '[events:joins]',
    parts: '[events:parts]',
    self: '[self]',
} as const satisfies Record<string, string>;

const colors = [
    'red',
    'green',
    'yellow',
    'blue',
    'magenta',
    'cyan',
    'white',
    'gray',
] as const satisfies (keyof typeof chalk)[];

const max = Object.values(entries).reduce(
    (accumulator, prefix) => Math.max(accumulator, prefix.length),
    0,
);

type Logger = {
    [key in keyof typeof entries]: {
        (...args: unknown[]): void;
        info: (...args: unknown[]) => void;
        warn: (...args: unknown[]) => void;
        error: (...args: unknown[]) => void;
    };
} & {
    info: (...args: unknown[]) => void;
    warn: (...args: unknown[]) => void;
    error: (...args: unknown[]) => void;
};

export const logger = Object.fromEntries([
    ...Object.entries(entries).map(([key, prefix], index) => {
        const color = colors[index % colors.length]!;

        const fn = console.info.bind(console, chalk[color](prefix.padStart(max)));

        return [
            key,
            Object.assign(fn, {
                info: console.info.bind(console, chalk[color](prefix.padStart(max))),
                warn: console.warn.bind(console, chalk[color](prefix.padStart(max))),
                error: console.error.bind(console, chalk[color](prefix.padStart(max))),
            }),
        ];
    }),
    ['info', console.info.bind(console, chalk.gray('[info]'.padStart(max)))],
    ['warn', console.warn.bind(console, chalk.yellowBright('[warn]'.padStart(max)))],
    ['error', console.error.bind(console, chalk.redBright('[error]'.padStart(max)))],
]) as Logger;
