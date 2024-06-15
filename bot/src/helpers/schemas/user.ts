import { z } from 'zod';

import { helix } from '~/services/apis/helix';

/**
 * Zod schema for a valid twitch login.
 *
 * Allows for inputs such as:
 * - login
 * - (at)login
 * - #login
 */
export function login() {
    return z.string().transform((value, { addIssue }) => {
        if (value.endsWith(',')) {
            value = value.slice(0, -1);
        }

        // we can reuse this schema for channels
        if (value.startsWith('@') || value.startsWith('#')) {
            value = value.slice(1);
        }

        if (!/^[\dA-Za-z]\w{2,24}$/.test(value)) {
            addIssue({
                message: 'Invalid twitch login',
                code: z.ZodIssueCode.custom,
            });
            return z.NEVER;
        }

        return value;
    });
}

/**
 * Zod schema for a valid twitch user ID.
 *
 * Allows for inputs such as:
 * - id:123456789
 */
export function id() {
    return z.string().transform((value, { addIssue }) => {
        if (!/^id:\d+$/.test(value)) {
            addIssue({
                message: 'Invalid user ID',
                code: z.ZodIssueCode.custom,
            });
            return z.NEVER;
        }

        return value.replace('id:', '');
    });
}

/**
 * Zod schema for either a user-specified twitch login or user ID.
 */
export function loginOrId() {
    return z.union([
        login().transform((value) => ({ login: value })),
        id().transform((value) => ({ id: value })),
    ]);
}

/**
 * Zod schema for a valid twitch user.
 *
 * Allows for inputs such as:
 * - login
 * - (at)login
 * - #login (if allowChannels is true)
 */
export function helixUser() {
    return loginOrId().transform(async (user, { addIssue }) => {
        if ('id' in user) {
            return await helix.users.getUserById(user.id);
        }

        if ('login' in user) {
            return await helix.users.getUserByName(user.login);
        }

        addIssue({
            message: 'Invalid user',
            code: z.ZodIssueCode.custom,
        });
        return z.NEVER;
    });
}
