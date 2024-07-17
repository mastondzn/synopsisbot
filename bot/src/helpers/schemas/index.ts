import { boolean } from './boolean';
import * as twitchUserSchemas from './user';

export const schemas = {
    twitch: { ...twitchUserSchemas },
    boolean,
};
