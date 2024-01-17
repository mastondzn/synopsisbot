import chalk from 'chalk';

const services = [
    ['rpc', '[services:rpc]'],
    ['chat', '[services:chat]'],
    ['auth', '[services:auth]'],
] as const satisfies [string, string][];

const modules = [
    ['channels', '[modules:channels]'],
    ['refresh', '[modules:refresh]'],
] as const satisfies [string, string][];

const colors = ['red', 'green', 'yellow', 'blue', 'magenta', 'cyan', 'white', 'gray'] as const;
const colorsBg = ['bgRed', 'bgGreen', 'bgYellow', 'bgBlue', 'bgMagenta', 'bgCyan', 'bgWhite', 'bgGray'] as const;

const max = [...services, ...modules].reduce(
    (accumulator, [, value]) => Math.max(accumulator, value.length),
    0,
);

export const prefixes = Object.fromEntries(
    [
        ...services.map(([key, value], index) => {
            return [key, chalk[colors[index]!](value).padEnd(max, ' ')];
        }),
        ...modules.map(([key, value], index) => {
            return [key, chalk[colorsBg[index]!](value).padEnd(max, ' ')];
        }),
    ],
) as Record<typeof services[number][0] | typeof modules[number][0], string>;
