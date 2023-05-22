import { relations } from 'drizzle-orm';

import {
    authedUsers,
    channels,
    commands,
    commandUsers,
    globalPermissions,
    localPermissions,
    states,
} from './tables';

export const authedUsersRelations = relations(authedUsers, () => ({}));
export const commandUsersRelations = relations(commandUsers, () => ({}));
export const globalPermissionsRelations = relations(globalPermissions, () => ({}));
export const statesRelations = relations(states, () => ({}));
export const commandsRelations = relations(commands, () => ({}));

export const channelsRelations = relations(
    channels, //
    ({ many }) => ({
        localPermissions: many(localPermissions),
    })
);
export const localPermissionsRelations = relations(
    localPermissions, //
    ({ one }) => ({
        channel: one(channels, {
            references: [channels.twitchId],
            fields: [localPermissions.channelId],
        }),
    })
);
