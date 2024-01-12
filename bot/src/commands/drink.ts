import ms from 'pretty-ms';

import { type CommandUser, commandUsers, eq } from '@synopsis/db';

import { rollBeverageWithModifier } from '~/data/beverages';
import type { BotCommand } from '~/types/client';

const defaultCooldown = 3 * 60 * 60 * 1000; // 3 hours

function hydratedRecently(commandUser: CommandUser): boolean {
    if (!commandUser.hydratedAt) { return false; }
    return Date.now() - commandUser.hydratedAt.getTime() < defaultCooldown;
}

export const command: BotCommand = {
    name: 'drink',
    description: 'Get a random drink and gain hydration points!',
    usage: [
        'drink',
        'Have a drink!',
        '',
        'drink points',
        'Check how many hydration points you have.',
    ].join('\n'),

    subcommands: [
        {
            path: ['points'],
            run: async ({ db, msg }) => {
                const user = await db.query.commandUsers.findFirst({
                    where: (commandUsers, { eq }) => eq(commandUsers.twitchId, msg.senderUserID),
                });

                if (!user) {
                    return {
                        reply: 'You have no hydration points!',
                    };
                }

                return {
                    reply: `You have ${user.hydrationPoints} hydration points!`,
                };
            },
        },
    ],

    run: async ({ db, msg }) => {
        let user = await db.query.commandUsers.findFirst({
            where: (commandUsers, { eq }) => eq(commandUsers.twitchId, msg.senderUserID),
        });

        if (!user) {
            [user] = await db
                .insert(commandUsers)
                .values({
                    twitchId: msg.senderUserID,
                    twitchLogin: msg.senderUsername,
                })
                .returning();
        }
        if (!user) { throw new Error('Failed to create command user'); }

        if (hydratedRecently(user)) {
            const timeLeft = ms(
                defaultCooldown - (Date.now() - user.hydratedAt!.getTime()), //
                {
                    unitCount: 2,
                    secondsDecimalDigits: 0,
                },
            );
            return { reply: `You are already hydrated! Try again in ${timeLeft}.` };
        }

        const { beverage, modifier, points } = rollBeverageWithModifier();
        const pointsNow = Math.round(user.hydrationPoints + points);

        await db
            .update(commandUsers)
            .set({
                hydratedAt: new Date(),
                hydrationPoints: pointsNow,
                twitchLogin: msg.senderUsername,
            })
            .where(eq(commandUsers.twitchId, msg.senderUserID));

        const lines = [`${beverage.message} ${beverage.emoji}`];
        if (modifier) { lines.push(modifier.message); }
        lines.push(
            points > 0 //
                ? `You gained ${points} points!`
                : `You lost ${Math.abs(points)} points.`,

            `You have ${pointsNow} ✨ hydration points now!`,
            '(3h cooldown...)',
        );

        return { reply: lines.join(' ') };
    },
};
