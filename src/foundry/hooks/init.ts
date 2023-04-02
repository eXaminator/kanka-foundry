import moduleConfig from '../../../public/module.json';
import KankaJournalApplication from '../../apps/KankaJournal/KankaJournalApplication';
import AccessToken from '../../api/AccessToken';
import { logError } from '../../util/logger';
import api from '../../api';
import { setCurrentCampaign } from '../../state/currentCampaign';
import executeMigrations from '../../executeMigrations';
import getGame from '../getGame';
import localization from '../../state/localization';
import { showError } from '../notifications';
import registerHandlebarsHelpers from '../../handlebars/registerHandlebarsHelper';
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

async function loadCurrentCampaignById(id: number | null): Promise<void> {
    if (!api.isReady) {
        return;
    }

    if (id) {
        setCurrentCampaign(await api.getCampaign(id));
    } else {
        setCurrentCampaign(undefined);
    }
}

export default async function init(): Promise<void> {
    try {
        Journal.registerSheet(moduleConfig.name, KankaJournalApplication, {
            makeDefault: false,
            label: 'Kanka-Foundry Journal sheet',
        });

        registerHandlebarsHelpers();

        registerSettings({
            baseUrl: value => api.switchBaseUrl(value ?? ''),
            accessToken: value => setToken(value ?? ''),
            campaign: value => value && loadCurrentCampaignById(parseInt(value, 10) || null),
            importLanguage: value => localization.setLanguage(value ?? getGame().i18n.lang),
        });

        // Debug output to show current rate limiting
        if (import.meta.env.DEV) {
            renderDebugElement();
        }

        api.switchBaseUrl(getSetting('baseUrl'));
        setToken(getSetting('accessToken'));

        // Async initialization processes start here. These need to be at the end, to ensure that everything
        // important for FoundryVTT has been handled synchroniously, because the hook usually doesn'T handle
        // async functions.
        await loadCurrentCampaignById(parseInt(getSetting('campaign'), 10));

        await localization.initialize();
        await localization.setLanguage(getSetting('importLanguage') ?? getGame().i18n.lang);

        await executeMigrations();
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
                .forEach(app => app.render(false));
        }
    });
}
