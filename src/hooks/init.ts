import AccessToken from '../api/AccessToken';
import kanka from '../kanka';
import { logError } from '../logger';
import api from '../module/api';
import { showError } from '../module/notifications';
import registerHandlebarsHelpers from '../module/registerHandlebarsHelper';
import { getSetting, registerSettings } from '../module/settings';

function setToken(token: string): void {
    if (!token) {
        api.reset();
        return;
    }

    try {
        const accessToken = new AccessToken(token);

        console.log('TOKEN in init', token);

        if (accessToken.isExpired()) {
            api.reset();
            showError('settings.error.ErrorTokenExpired');
            return;
        }

        if (accessToken.isExpiredWithin(7 * 24 * 60 * 60)) {
            // One week
            showError('settings.error.WarningTokenExpiration');
        }

        api.switchUser(accessToken);
    } catch (error) {
        logError('Error setting a token', error);
        showError('settings.error.ErrorInvalidAccessToken');
    }
}

function renderDebugElement(): void {
    const debugElement = $('<span class="kanka-limit-debug">0 / 0 (0)</span>');
    $('body').append(debugElement);
    api.limiter.onChange((event) => {
        debugElement.text(`${event.usedSlots} / ${event.maxSlots} (${event.queue})`);
    });
}

export default async function init(): Promise<void> {
    registerHandlebarsHelpers();
    registerSettings({
        baseUrl: value => api.switchBaseUrl(value ?? ''),
        accessToken: value => setToken(value ?? ''),
        campaign: value => value && kanka.loadCurrentCampaignById(parseInt(value, 10) || null),
        importLanguage: value => kanka.setLanguage(value ?? 'en'),
    });

    // Debug output to show current rate limiting
    if (import.meta.env.DEV) {
        renderDebugElement();
    }

    api.switchBaseUrl(getSetting('baseUrl'));
    setToken(getSetting('accessToken'));
    await kanka.initialize();
}

if (import.meta.hot) {
    import.meta.hot.dispose(async () => {
        $('.kanka-limit-debug').remove();
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
