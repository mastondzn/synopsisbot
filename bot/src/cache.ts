import { Redis } from 'ioredis';

export const makeCache = ({ host, password }: { host: string; password: string }): Redis => {
    return new Redis({
        host,
        password,
    });
};
