import { getCommands } from '~/commands';

describe('commands', () => {
    it('should return a list of commands', async () => {
        const commands = await getCommands();
        expect(commands.size).toBeGreaterThan(0);
    });

    it('should return a list of commands with names', async () => {
        const commands = await getCommands();
        expect(commands.map(command => command?.name).every(Boolean)).toBe(true);
    });

    it('should return a list of commands with run methods', async () => {
        const commands = await getCommands();
        expect(
            commands.map(command => command?.run).every(callback => typeof callback === 'function'),
        ).toBe(true);
    });
});
