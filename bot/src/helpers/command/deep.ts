import type {
    BotCommandContext,
    BotCommandFunction,
    BotCommandResult,
} from '~/types/client';

export interface DeepCommandRecord {
    [key: string]: (() => BotCommandResult) | DeepCommandRecord
}

export function getPaths(subcommands: DeepCommandRecord): string[][] {
    const paths: string[][] = [];

    const keys = Object.keys(subcommands);
    for (const key of keys) {
        const value = subcommands[key]!;
        if (typeof value === 'function') {
            paths.push([key]);
        }
        else {
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
    ctx: BotCommandContext
    commands: DeepCommandRecord
    onNotFound: BotCommandFunction
}): BotCommandResult {
    const parameters = ctx.params.list;
    const paths = getPaths(commands);

    let command: DeepCommandRecord | BotCommandFunction | undefined = commands;
    for (const path of paths) {
        const desiredPath = parameters.slice(0, path.length);
        if (path.join(' ') === desiredPath.join(' ')) {
            for (const accessor of desiredPath) {
                command = (command as DeepCommandRecord)[accessor];
            }
            break;
        }
    }

    if (!command || command === commands) { command = onNotFound; }
    if (typeof command !== 'function') { throw new TypeError('Command not found'); }

    return command(ctx);
}
