import inquirer from 'inquirer';
import { z } from 'zod';

import { authedUsers } from '@synopsis/db';
import { parseEnv } from '@synopsis/env';
import { allScopes } from '@synopsis/scopes';

import { type DatabaseScript } from '~/types/scripts';

export const script: DatabaseScript = {
    description: 'get a new auth token for the bot',
    type: 'db',
    run: async ({ db }) => {
        const env = parseEnv(process.env);

        const baseUrl = new URL('https://id.twitch.tv/oauth2/authorize');
        baseUrl.searchParams.set('client_id', env.TWITCH_CLIENT_ID);
        baseUrl.searchParams.set('redirect_uri', 'http://localhost:3000');
        baseUrl.searchParams.set('response_type', 'code');

        baseUrl.searchParams.set('scope', allScopes.join(' '));
        console.log('Open this URL in your browser:');
        console.log(baseUrl.toString());

        const { url } = await inquirer.prompt<{ url: string }>({
            type: 'input',
            name: 'url',
            message: 'Paste the URL you were redirected to here:',
        });

        const urlObj = new URL(url);
        const code = urlObj.searchParams.get('code');
        if (!code) throw new Error('No code found in URL!');
        const scopes = urlObj.searchParams.get('scope')?.split('\n');
        if (!scopes) throw new Error('No scopes found in URL!');

        const response = await fetch('https://id.twitch.tv/oauth2/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: `client_id=${env.TWITCH_CLIENT_ID}&client_secret=${env.TWITCH_CLIENT_SECRET}&code=${code}&grant_type=authorization_code&redirect_uri=http://localhost:3000`,
        });

        const responseSchema = z.object({
            access_token: z.string(),
            expires_in: z.number(),
            refresh_token: z.string(),
            scope: z.array(z.string()),
            token_type: z.string(),
        });

        const json = (await response.json()) as unknown;
        console.log(json);
        const data = responseSchema.parse(json);

        const expiresAt = Date.now() + data.expires_in * 1000 - 60 * 1000;

        await db.insert(authedUsers).values({
            twitchId: env.TWITCH_BOT_ID,
            twitchLogin: env.TWITCH_BOT_USERNAME,
            scopes: data.scope,
            accessToken: data.access_token,
            refreshToken: data.refresh_token,
            expiresAt: new Date(expiresAt),
            obtainedAt: new Date(),
        });
    },
};
