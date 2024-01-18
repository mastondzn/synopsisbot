import { beforeAll, describe, expect, it } from 'vitest';

import { commands } from '~/commands';

beforeAll(async () => {
    await commands.load();
});

// need to fix db call during import
describe('commands', () => {
    it('should return a list of commands', () => {
        expect(commands.size).toBeGreaterThan(0);
    });

    it('should return a list of commands with names', () => {
        expect(commands.map(command => command.name).every(Boolean)).toBe(true);
    });

    it('should return a list of commands with run methods or subcommands with run methods', () => {
        expect(commands.every((command) => {
            if ('run' in command && typeof command.run === 'function') {
                return true;
            }

            if ('subcommands' in command) {
                return command.subcommands.every(
                    subcommand => 'run' in subcommand
                    && typeof subcommand.run === 'function',
                );
            }

            return false;
        })).toBe(true);
    });
});
