import { type BotCommandContext, type BotCommandFunction } from '~/types/client';

export interface DeepCommandRecord {
    [key: string]: (() => Promise<void> | void) | DeepCommandRecord;
}

export function getPaths(subcommands: DeepCommandRecord): string[][] {
    const paths: string[][] = [];

    const keys = Object.keys(subcommands);
    for (const key of keys) {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const value = subcommands[key]!;
        if (typeof value === 'function') {
            paths.push([key]);
        } else {
            const subPaths = getPaths(value);
            for (const path of subPaths) {
                paths.push([key, ...path]);
            }
        }
    }

    return paths;
}

export function runDeepCommand({
    ctx,
    commands,
    onNotFound,
}: {
    ctx: BotCommandContext;
    commands: DeepCommandRecord;
    onNotFound: BotCommandFunction;
}): Promise<void> | void {
    const params = ctx.params.list;
    const paths = getPaths(commands);

    let command: DeepCommandRecord | BotCommandFunction | undefined = commands;
    for (const path of paths) {
        const desiredPath = params.slice(0, path.length);
        if (path.join(' ') === desiredPath.join(' ')) {
            for (const accessor of desiredPath) {
                command = (command as DeepCommandRecord)[accessor];
            }
            break;
        }
    }

    if (!command || command === commands) command = onNotFound;
    if (typeof command !== 'function') throw new Error('Command not found');

    return command(ctx);
}
