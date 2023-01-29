import kanka from '../kanka';
import registerHandlebarsHelpers from '../module/registerHandlebarsHelper';
import { registerSettings } from '../module/settings';

export default async function init(): Promise<void> {
    registerHandlebarsHelpers();
    registerSettings({
        baseUrl: value => kanka.setBaseUrl(value ?? ''),
        accessToken: value => kanka.setToken(value ?? ''),
        campaign: value => value && kanka.loadCurrentCampaignById(parseInt(value, 10) || null),
        importLanguage: value => kanka.setLanguage(value ?? 'en'),
    });
    await kanka.initialize();
}

if (import.meta.hot) {
    import.meta.hot.dispose(async () => {
        await kanka.dispose();
    });

    import.meta.hot.accept((newModule) => {
        if ((game as Game).ready) {
            newModule?.default();

            Object
                .values(ui.windows)
                .forEach(app => app.render(false));
        }
    });
}
