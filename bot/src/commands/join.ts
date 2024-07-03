import { channels, eq } from '@synopsis/db';
import type { HelixUser } from '@twurple/api';
import { z } from 'zod';

import { create } from '~/helpers/creators';
import { schemas } from '~/helpers/schemas';
import { trim } from '~/helpers/tags';
import { chat } from '~/services/chat';
import { db } from '~/services/database';

export default create.command({
    name: 'join',
    description: 'Make the bot join a channel',
    permissions: { global: 'owner' },
    usage: [
        ['join channel:<channel>', 'Joins the specified channel'],
        ['join channel:<channel> mode:<mode>', 'Joins the specified channel in the specified mode'],
    ],
    options: {
        mode: {
            schema: z.enum(['readonly', 'all', 'offlineonly', 'liveonly']).default('all'),
        },
    },
    arguments: [
        schemas.twitch
            .helixUser()
            .refine(
                (channel): channel is HelixUser => channel !== null,
                'Channel could not be found',
            ),
    ],
    run: async ({ options: { mode }, args: [channel] }) => {
        const existing = await db.query.channels.findFirst({
            where: (channels, { eq }) => eq(channels.twitchId, channel.id),
        });

        if (!existing) {
            await db.insert(channels).values({
                twitchId: channel.id,
                twitchLogin: channel.name,
                mode,
            });
            await chat.join(channel.name);
            return { reply: `Joined channel ${channel.displayName} in ${mode} mode.` };
        }

        if (existing.mode === mode) {
            await chat.join(channel.name);
            return {
                reply: trim`
                    Channel ${channel.name} is already present in the database with same mode.
                    Attempted to join again.
                `,
            };
        }

        await db.update(channels).set({ mode }).where(eq(channels.twitchId, channel.id));
        await chat.join(channel.name);
        return {
            reply: trim`
                Channel ${channel.name} is already present in the database.
                Updated mode from ${existing.mode} to ${mode} and attempted to join again.
            `,
        };
    },
});
