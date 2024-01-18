export interface BotModule {
    name: string;
    priority?: number;
    description?: string;
    register: () => Promise<void> | void;
}
