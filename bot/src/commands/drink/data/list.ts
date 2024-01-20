import type { Beverage } from './types';

export const beveragesArray = [
    {
        identifier: 'milk',
        emoji: '🥛',
        message: "You'll have a Glass of Milk.",
        weight: 80,
        points: 20,
        modifiers: [
            {
                name: 'expired',
                message: "It's expired though!",
                chance: 0.1,
                multiplier: -0.6,
            },
        ],
    },
    {
        identifier: 'tea',
        emoji: '🍵🫖',
        message: 'You sip on a Cup of Tea.',
        weight: 110,
        points: 30,
        modifiers: [
            {
                name: 'hot',
                message: "It's too hot!",
                chance: 0.2,
                multiplier: 0.6,
            },
            {
                name: 'perfect',
                message: "It's just the right temperature!",
                chance: 0.2,
                multiplier: 1.6,
            },
        ],
    },
    {
        identifier: 'sake',
        emoji: '🍶',
        message: 'You drink a Glass of Sake.',
        weight: 15,
        points: 40,
        modifiers: [
            {
                name: 'aftertaste',
                message: 'It has a weird aftertaste though 🫤.',
                chance: 0.3,
                multiplier: 0.8,
            },
        ],
    },
    {
        identifier: 'wine',
        emoji: '🍷',
        message: 'You drink a Glass of Wine.',
        weight: 20,
        points: 40,
        modifiers: [
            {
                name: 'feelings',
                message: 'It makes you get in your feelings 🫤.',
                chance: 0.15,
                multiplier: 0.8,
            },
        ],
    },
    {
        identifier: 'margarita',
        emoji: '🍸',
        message: 'You sip on a Margarita.',
        weight: 15,
        points: 100,
        modifiers: [
            {
                name: 'bitter',
                message: 'It tastes a bit bitter.',
                chance: 0.4,
                multiplier: 0.8,
            },
        ],
    },
    {
        identifier: 'lemonade',
        emoji: '🍋🍹',
        message: 'You drink a Lemonade.',
        weight: 30,
        points: 80,
        modifiers: [
            {
                name: 'bitter',
                message: 'It tastes a bit bitter.',
                chance: 0.2,
                multiplier: 0.8,
            },
        ],
    },
    {
        identifier: 'pina-colada',
        emoji: '🍍🍹',
        message: 'You enjoy a classic Pina Colada.',
        weight: 10,
        points: 150,
        modifiers: [
            {
                name: 'refreshing',
                message: 'This one is very refreshing.',
                chance: 0.2,
                multiplier: 1.6,
            },
        ],
    },
    {
        identifier: 'beer',
        emoji: '🍺',
        message: 'You enjoy a Beer.',
        weight: 40,
        points: 30,
    },
    {
        identifier: 'whiskey',
        emoji: '🥃',
        message: 'You drink a Glass of Whiskey.',
        weight: 20,
        points: 70,
    },
    {
        identifier: 'spillage',
        emoji: '🫗',
        message: 'You spilled your beverage.',
        weight: 70,
        points: -40,
    },
    {
        identifier: 'water',
        emoji: '💧🫗',
        message: 'You drink a Glass of Water.',
        weight: 120,
        points: 10,
    },
    {
        identifier: 'boba',
        emoji: '🧋',
        message: 'You have some Bubble Tea.',
        weight: 50,
        points: 30,
    },
    {
        identifier: 'coffee',
        emoji: '☕',
        message: 'You drink a Cup of Coffee.',
        weight: 100,
        points: 20,
    },
    {
        identifier: 'hot-chocolate',
        emoji: '🍫☕',
        message: 'You drink a Cup of Hot Chocolate.',
        weight: 25,
        points: 60,
    },
    {
        identifier: 'juice',
        emoji: '🧃',
        message: 'You drink some Fruit Juice.',
        weight: 60,
        points: 30,
    },
    {
        identifier: 'smoothie',
        emoji: '🥤',
        message: 'You drink a Smoothie.',
        weight: 40,
        points: 40,
    },
    {
        identifier: 'milkshake',
        emoji: '🍦🥛',
        message: 'You drink a Milkshake.',
        weight: 20,
        points: 60,
    },
    {
        identifier: 'milk-tea',
        emoji: '🍵🥛',
        message: 'You some Milk Tea.',
        weight: 30,
        points: 60,
    },
] satisfies Beverage[];
