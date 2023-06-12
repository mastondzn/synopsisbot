import { type AccessToken, RefreshingAuthProvider } from '@twurple/auth';
import { EventEmitter } from 'eventemitter3';

import { type Database } from '@synopsis/db';

export interface BotAuthProviderOptions {
    db: Database;
    clientId: string;
    clientSecret: string;
    twitchId: string;
    accessToken: string;
    refreshToken: string;
    scopes: string[];
    expiresAt: Date;
    obtainedAt: Date;
}

export class BotAuthProvider extends RefreshingAuthProvider {
    // eslint-disable-next-line unicorn/prefer-event-target
    events = new EventEmitter<{ refresh: [AccessToken & { userId: string }] }>();

    constructor(options: BotAuthProviderOptions) {
        const onRefresh = async (userId: string, token: AccessToken) => {
            await options.db.edit.authedUserById(userId, {
                accessToken: token.accessToken,
                scopes: token.scope,
                ...(token.refreshToken ? { refreshToken: token.refreshToken } : {}),
                ...(token.expiresIn
                    ? { expiresAt: new Date(Date.now() + token.expiresIn * 1000) }
                    : {}),
            });

            this.events.emit('refresh', { ...token, userId });
            token.expiresIn
                ? setTimeout(() => this.refreshAccessTokenForIntent('chat'), token.expiresIn * 1000)
                : console.error('[utils:auth] no expiresIn');
        };

        super({
            clientId: options.clientId,
            clientSecret: options.clientSecret,
            onRefresh,
        });

        this.addUser(
            options.twitchId,
            {
                expiresIn: (options.expiresAt.getTime() - Date.now()) / 1000,
                obtainmentTimestamp: options.obtainedAt.getTime(),
                accessToken: options.accessToken,
                refreshToken: options.refreshToken,
            },
            ['chat']
        );

        setTimeout(() => {
            console.log('[utils:auth] refreshing bot oauth token');
            void this.refreshAccessTokenForIntent('chat');
        }, options.expiresAt.getTime() - Date.now());
    }
}
