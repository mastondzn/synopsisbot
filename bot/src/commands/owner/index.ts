import { subcommands } from './subcommands';
import type { BotCommand } from '~/types/client';

export const command: BotCommand = {
    name: 'owner',
    description: 'Lets the owner do certain things. Like joining and parting channels.',
    permission: { global: 'owner' },
    usage: [
        'owner part <channel>',
        'Parts the bot from the specified channel.',
        '',
        'owner join <channel>',
        'owner join <channel> offlineonly',
        'owner join <channel> readonly',
        'owner join <channel> all',
        'Joins the bot to the specified channel. Defaults to offlineonly mode.',
        '',
        'owner global ban <user>',
        'owner global unban <user>',
        'Globally bans or unbans a user from using the bot.',
        '',
        'owner local ban <channel|"_"> <user>',
        'owner local unban <channel|"_"> <user>',
        'owner local ambassador <channel|"_"> <user>',
        'owner local unambassador <channel|"_"> <user>',
        'Locally bans, unbans, promotes or demotes a user in the specified channel. "_" can be used to target current channel.',
    ].join('\n'),

    subcommands,

    run: () => ({ reply: 'Please specify a subcommand such as \'sb owner join ...\'' }),
};
