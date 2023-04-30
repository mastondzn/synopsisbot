import Inquirer from 'inquirer';

export const prompt = ({ message }: { message: string }) => {
    return Inquirer.prompt<{ response: string }>({
        type: 'input',
        name: 'response',
        message,
    }) as Promise<{ response: string }>;
};

export const listPrompt = <const T extends readonly unknown[] | unknown[]>({
    list,
    message,
}: {
    list: T;
    message: string;
}) => {
    return Inquirer.prompt<{ response: T[number] }>({
        type: 'list' as never,
        choices: list,
        name: 'response',
        message,
    }) as Promise<{ response: T[number] }>;
};
