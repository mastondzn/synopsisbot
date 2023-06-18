import ms from 'pretty-ms';

import { type Hydration } from '@synopsis/db';

import { rollBeverageWithModifier } from '~/data/beverages';
import { type BotCommand } from '~/types/client';

const defaultCooldown = 3 * 60 * 60 * 1000; // 3 hours

const hydratedRecently = (hydrationData: Hydration): boolean => {
    if (!hydrationData.last) return false;
    return Date.now() - hydrationData.last.getTime() < defaultCooldown;
};

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
                const hydration = await db.hydration.findFirst({
                    where: { userTwitchId: msg.senderUserID },
                });

                if (!hydration?.points) {
                    return {
                        reply: 'You have no hydration points!',
                    };
                }

                return {
                    reply: `You have ${hydration.points} hydration points!`,
                };
            },
        },
    ],

    run: async ({ db, msg }) => {
        let hydration = await db.hydration.findFirst({
            where: { userTwitchId: msg.senderUserID },
        });

        if (!hydration) {
            const user = await db.botUser.upsert({
                where: { twitchId: msg.senderUserID, twitchLogin: msg.senderUsername },
                create: {
                    twitchId: msg.senderUserID,
                    twitchLogin: msg.senderUsername,
                    hydration: {},
                },
                include: { hydration: true },
                update: {},
            });

            hydration = user.hydration!;
        }

        if (hydratedRecently(hydration)) {
            const timeLeft = ms(
                defaultCooldown - (Date.now() - hydration.last!.getTime()), //
                {
                    unitCount: 2,
                    secondsDecimalDigits: 0,
                }
            );
            return { reply: `You are already hydrated! Try again in ${timeLeft}.` };
        }

        const { beverage, modifier, points } = rollBeverageWithModifier();
        const pointsNow = Math.round(hydration.points + points);

        await db.hydration.update({
            where: { userTwitchId: msg.senderUserID },
            data: {
                last: new Date(),
                points: pointsNow,
            },
        });

        const lines = [`${beverage.message} ${beverage.emoji}`];
        if (modifier) lines.push(modifier.message);
        lines.push(
            points > 0 //
                ? `You gained ${points} points!`
                : `You lost ${Math.abs(points)} points.`,

            `You have ${pointsNow} ✨ hydration points now!`,
            '(3h cooldown...)'
        );

        return { reply: lines.join(' ') };
    },
};
