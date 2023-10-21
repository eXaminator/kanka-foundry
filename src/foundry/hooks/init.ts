import moduleConfig from '../../../public/module.json';
import api from '../../api';
import AccessToken from '../../api/AccessToken';
import KankaJournalApplication from '../../apps/KankaJournal/KankaJournalApplication';
import registerHandlebarsHelpers from '../../handlebars/registerHandlebarsHelper';
import { setCurrentCampaignById } from '../../state/currentCampaign';
import localization from '../../state/localization';
import { logError } from '../../util/logger';
import getGame from '../getGame';
import { showError } from '../notifications';
import { getSetting, registerSettings } from '../settings';

function setToken(token: string): void {
    if (!token) {
        api.reset();
        return;
    }

    try {
        const accessToken = new AccessToken(token);

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

export default function init(): void {
    try {
        Journal.registerSheet(moduleConfig.name, KankaJournalApplication, {
            makeDefault: false,
            label: 'Kanka-Foundry Journal sheet',
        });

        registerHandlebarsHelpers();

        registerSettings({
            baseUrl: value => api.switchBaseUrl(value ?? ''),
            accessToken: value => setToken(value ?? ''),
            campaign: value => value && setCurrentCampaignById(parseInt(value, 10) || null),
            importLanguage: value => localization.setLanguage(value ?? getGame().i18n.lang),
        });

        // Debug output to show current rate limiting
        if (import.meta.env.DEV) {
            renderDebugElement();
        }

        api.switchBaseUrl(getSetting('baseUrl'));
        setToken(getSetting('accessToken'));
    } catch (error) {
        logError(error);
        showError('general.initializationError');
    }
}

if (import.meta.hot) {
    import.meta.hot.dispose(async () => {
        $('.kanka-limit-debug').remove();
    });

    import.meta.hot.accept((newModule) => {
        if ((game as Game).ready) {
            newModule?.default();

            Object
                .values(ui.windows)
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                .forEach((app: any) => app.render(false));
        }
    });
}
