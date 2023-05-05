import { getCommands } from '~/commands';

describe('commands', () => {
    it('should return a list of commands', async () => {
        const commands = await getCommands();
        expect(commands.size).toBeGreaterThan(0);
    });

    it('should return a list of commands with names', async () => {
        const commands = await getCommands();
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        expect(commands.map((command) => command?.name).every(Boolean)).toBe(true);
    });

    it('should return a list of commands with run methods', async () => {
        const commands = await getCommands();
        expect(
            // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
            commands.map((command) => command?.run).every((cb) => typeof cb === 'function')
        ).toBe(true);
    });
});
