import chalk from 'chalk';

const entries = [
    ['rpc', '[services:rpc]'],
    ['chat', '[services:chat]'],
    ['auth', '[services:auth]'],

    ['channels', '[modules:channels]'],
    ['db-commands', '[modules:db-commands]'],

    ['refresh', '[crons:refresh]'],
    ['dev-announce', '[crons:dev-announce]'],

    ['commands', '[events:commands]'],
    ['init', '[events:init]'],
    ['joins', '[events:joins]'],
    ['parts', '[events:parts]'],
] as const satisfies [string, string][];

const colors = ['red', 'green', 'yellow', 'blue', 'magenta', 'cyan', 'white', 'gray'] as const;

const max = entries.reduce(
    (accumulator, [, value]) => Math.max(accumulator, value.length),
    0,
);

export const prefixes = Object.fromEntries(
    [...entries].map(([key, value], index) => {
        const color = colors[index % colors.length]!;
        return [key, chalk[color](value.padStart(max, ' '))];
    }),
) as Record<typeof entries[number][0], string>;
