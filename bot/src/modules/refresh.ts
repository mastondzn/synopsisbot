import { defineModule } from '~/helpers/module';

export default defineModule({
    name: 'refresh',
    description: 'ensures the bot\'s oauth token is always up to date',
    register: () => {
        // authProvider.onRefreshFailure((userId, error) => {});
        //
        // authProvider.onRefresh((userId, token) => {
        //     if (userId !== env.TWITCH_BOT_ID) return;
        //     console.log('refreshed bot token');
        // });
    },
});
