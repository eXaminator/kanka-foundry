import moduleConfig from '../../public/module.json';
import KankaJournalApplication from '../KankaJournal/KankaJournalApplication';
import AccessToken from '../api/AccessToken';
import { logError } from '../logger';
import migrateV1 from '../migrations/migrateV1';
import migrateV2 from '../migrations/migrateV2';
import migrateV3 from '../migrations/migrateV3';
import migrateV4 from '../migrations/migrateV4';
import api from '../module/api';
import { setCurrentCampaign } from '../module/currentCampaign';
import getGame from '../module/getGame';
import localization from '../module/localization';
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

        await migrateV1();
        await migrateV2();
        await migrateV3();
        await migrateV4();
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
