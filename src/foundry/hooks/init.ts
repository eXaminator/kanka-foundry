import moduleConfig from '../../../public/module.json';
import api from '../../api';
import AccessToken from '../../api/AccessToken';
import KankaJournalApplication from '../../apps/KankaJournal/KankaJournalApplication';
import registerHandlebarsHelpers from '../../handlebars/registerHandlebarsHelper';
import { setCurrentCampaignById } from '../../state/currentCampaign';
import localization from '../../state/localization';
import { logError } from '../../util/logger';
import getGame from '../getGame';
import { showError, showWarning } from '../notifications';
import { getSetting, registerSettings } from '../settings';
import PostPageSheet from '../../apps/KankaJournal/PostPageSheet';
import KankaPageModel from '../../apps/KankaJournal/models/KankaPageModel';
import DefaultPageSheet from '../../apps/KankaJournal/DefaultPageSheet';

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

        // Token is less than a week from expiration
        if (accessToken.isExpiredWithin(7 * 24 * 60 * 60)) {
            showWarning('settings.error.WarningTokenExpiration');
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
        const pageTypes = Object.keys(moduleConfig.documentTypes.JournalEntryPage).map(type => `${moduleConfig.id}.${type}`);
        const dataModelTypes = pageTypes.filter(type => ![`${moduleConfig.id}.post`].includes(type));

        Object.assign(
            CONFIG.JournalEntryPage.dataModels,
            dataModelTypes.reduce<Record<string, unknown>>((config, type) => ({
                ...config,
                [type]: KankaPageModel,
            }), {}),
        );

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        DocumentSheetConfig.registerSheet(JournalEntry, moduleConfig.name, KankaJournalApplication, {
            makeDefault: false,
        });

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        DocumentSheetConfig.registerSheet(JournalEntryPage, moduleConfig.name, PostPageSheet, {
            types: [`${moduleConfig.id}.post`],
            makeDefault: false,
        });

        DocumentSheetConfig.registerSheet(JournalEntryPage, moduleConfig.name, DefaultPageSheet as any, {
            types: pageTypes.filter(type => ![`${moduleConfig.id}.post`].includes(type)),
            makeDefault: false,
        });

        registerHandlebarsHelpers();

        registerSettings({
            baseUrl: value => api.switchBaseUrl(value ?? ''),
            accessToken: value => setToken(value ?? ''),
            campaign: value => value && setCurrentCampaignById(parseInt(value, 10) || null),
            importLanguage: async (value) => {
                await localization.setLanguage(value ?? getGame().i18n.lang);
                Object
                    .values(window.ui.windows as Record<number, Application>)
                    .filter(app => app instanceof KankaJournalApplication)
                    .forEach(app => app.render());
            },
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
                .filter((app: any) => app.constructor?.name === 'KankaJournalApplication')
                .forEach(async (app: any) => {
                    app.object._onSheetChange({ sheetOpen: true });
                });
        }
    });
}
