import { type CommandUser, commandUsers, eq } from '@synopsis/db';
import ms from 'pretty-ms';

import { rollBeverageWithModifier } from './data';
import { create } from '~/helpers/creators';
import { db } from '~/services/database';

const defaultCooldown = 3 * 60 * 60 * 1000; // 3 hours

function hydratedRecently(
    commandUser: CommandUser,
): commandUser is CommandUser & { hydratedAt: Date } {
    if (!commandUser.hydratedAt) {
        return false;
    }
    return Date.now() - commandUser.hydratedAt.getTime() < defaultCooldown;
}

export default create.command({
    name: 'drink',
    description: 'Get a random drink and gain hydration points!',
    usage: [
        ['drink', 'Get a random drink and gain hydration points!'],
        ['drink points', 'Check how many hydration points you have.'],
    ],
    subcommands: [
        create.subcommand({
            path: ['points'],
            run: async ({ message }) => {
                const user = await db.query.commandUsers.findFirst({
                    where: (commandUsers, { eq }) =>
                        eq(commandUsers.twitchId, message.senderUserID),
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
        }),
        create.subcommand({
            path: [],
            run: async ({ message }) => {
                let user = await db.query.commandUsers.findFirst({
                    where: (commandUsers, { eq }) =>
                        eq(commandUsers.twitchId, message.senderUserID),
                });

                if (!user) {
                    [user] = await db
                        .insert(commandUsers)
                        .values({
                            twitchId: message.senderUserID,
                            twitchLogin: message.senderUsername,
                        })
                        .returning();
                }
                if (!user) {
                    throw new Error('Failed to create command user');
                }

                if (hydratedRecently(user)) {
                    const timeLeft = ms(
                        defaultCooldown - (Date.now() - user.hydratedAt.getTime()), //
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
                        twitchLogin: message.senderUsername,
                    })
                    .where(eq(commandUsers.twitchId, message.senderUserID));

                const lines = [`${beverage.message} ${beverage.emoji}`];
                if (modifier) {
                    lines.push(modifier.message);
                }

                lines.push(
                    points > 0 //
                        ? `You gained ${points} points!`
                        : `You lost ${Math.abs(points)} points.`,

                    `You have ${pointsNow} ✨ hydration points now!`,
                    '(3h cooldown...)',
                );

                return { reply: lines.join(' ') };
            },
        }),
    ],
});
