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
                message: 'Invalid Twitch login',
                code: z.ZodIssueCode.custom,
            });
            return z.NEVER;
        }

        return value.toLowerCase();
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
                message: 'Invalid Twitch user ID',
                code: z.ZodIssueCode.custom,
            });
            return z.NEVER;
        }

        return value.replace('id:', '');
    });
}

export function idOrLogin() {
    return z.union([
        id().transform((value) => ({ id: value })),
        login().transform((value) => ({ login: value })),
    ]);
}

export function helixId() {
    return id().transform(async (id) => await helix.users.getUserById(id));
}

export function helixLogin() {
    return login().transform(async (login) => await helix.users.getUserByName(login));
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
    return z.union([helixLogin(), helixId()]);
}
