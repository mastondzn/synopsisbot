import ms from 'pretty-ms';

import { type CommandUser, commandUsers, eq } from '@synopsis/db';

import { rollBeverageWithModifier } from '~/data/beverages';
import { type BotCommand } from '~/types/client';

const defaultCooldown = 3 * 60 * 60 * 1000; // 3 hours

const hydratedRecently = (commandUser: CommandUser): boolean => {
    if (!commandUser.hydratedAt) return false;
    return Date.now() - commandUser.hydratedAt.getTime() < defaultCooldown;
};

export const command: BotCommand = {
    name: 'drink',
    description: 'Get a random drink and gain hydration points!',
    usage: [
        'drink', //
        'drink points',
    ].join('\n'),

    run: async ({ db, reply, msg, params }) => {
        let [user] = await db
            .select()
            .from(commandUsers)
            .where(eq(commandUsers.twitchId, msg.senderUserID))
            .limit(1);

        if (!user) {
            [user] = await db
                .insert(commandUsers)
                .values({
                    twitchId: msg.senderUserID,
                    twitchLogin: msg.senderUsername,
                })
                .returning();
        }
        if (!user) throw new Error('Failed to create command user');

        if (params.list.at(0)?.toLowerCase() === 'points') {
            return await reply(
                `You have ${user.hydrationPoints} hydration points${
                    user.hydrationPoints > 0 ? '!' : '.'
                }`
            );
        }

        if (hydratedRecently(user)) {
            const timeLeft = ms(
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                defaultCooldown - (Date.now() - user.hydratedAt!.getTime()), //
                {
                    unitCount: 2,
                    secondsDecimalDigits: 0,
                }
            );
            return await reply(`You are already hydrated! Try again in ${timeLeft}.`);
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
        if (modifier) lines.push(modifier.message);
        lines.push(
            points > 0 //
                ? `You gained ${points} points!`
                : `You lost ${points} points.`,

            `You have ${pointsNow} ✨ hydration points now!`,
            'Hydrate again in 3 hours 😊!'
        );

        return await reply(lines.join(' '));
    },
};
